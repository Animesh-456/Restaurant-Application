const express = require('express');
const app = express();
require("dotenv").config();

const bodyParser = require('body-parser');
var cookieParser = require("cookie-parser");
const session = require('express-session');
const bcrypt = require('bcrypt');
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }));
app.set('trust proxy', 1);
app.use(cookieParser());
app.use(session({
    key: "user_sid",
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        expires: 600000,
        httpOnly: true
    }
}));

const mongoose = require('mongoose');
const { text } = require('body-parser');
mongoose.connect(process.env.connect, { UseNewUrlParser: true });

const customerSchema = new mongoose.Schema({
    username: {
        unique: true,
        type: String,
        required: true
    },
    fname: {
        type: String,
        required: true
    },
    lname: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        required: true
    },
    mobile: {
        type: Number,
        required: true
    },
    cart: {
        type: Array,
    },
    password: {
        type: String,
        required: true
    }
});

const foodSchema = new mongoose.Schema({
    itemName: {
        type: String,
        required: true
    },
    FoodItem: {
        type: String,
        required: true
    },
    itemType: {
        type: String,
        required: true
    },
    itemPrice: {
        type: String,
        required: true
    },
    itemurl: {
        type: String,
        required: true
    }
});

const restaurantSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    Items: {
        type: Array,
        required: true
    },
    OrderDateTime: {
        type: String,
        required: true
    },
    GrandTotal: {
        type: String,
        required: true
    },
    OrderStatus: {
        type: String,
        required: true
    }
});

const feedbackSchema= new mongoose.Schema({
    userEmail: {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    }, 
    message: {
        type: String,
        required: true
    }
})


const User = new mongoose.model("User", customerSchema);
const Food = new mongoose.model("Food", foodSchema);
const Restaurant = new mongoose.model("Restaurant", restaurantSchema);
const Order = new mongoose.model("Order", orderSchema);
const Feedback = new mongoose.model("Feedback", feedbackSchema);

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user && !req.session.restaurant) {
        res.clearCookie("user_sid");
    }
    next();
});


// middleware functions to check for logged-in users
var sessionChecker = (req, res, next) => {
    if ((req.session.user && req.cookies.user_sid)) {
        res.redirect("dashboard");
    } else {
        next();
    }
};

var restsessionchecker = (req, res, next) => {
    if ((req.session.restaurant && req.cookies.user_sid)) {
        res.redirect("food");
    } else {
        next();
    }
}

// Customer Endpoint

// Home
app.get("/", (req, res) => {
    var userLogged, restLogged = false;
    if (req.session.user && req.cookies.user_sid) {
        userLogged = true;
    } else {
        userLogged = false;
    }
    if (req.session.restaurant && req.cookies.user_sid) {
        restLogged = true;
    } else {
        restLogged = false;
    }

    Food.find((err, docs) => {
        if (!err) {
            res.render("home", {
                food: docs,
                userLogged: userLogged,
                restLogged: restLogged
            });
        }
    });
})


// Login
app.get("/login", sessionChecker, async (req, res) => {
    res.render("login", { alert: '' });
});

app.post("/login", async (req, response) => {

    const usernam = req.body.email;
    const password = req.body.password;

    try {

        User.findOne({ username: usernam }, (err, res) => {
            if (!res) {
                response.render("login", { alert: 'Incorrect Username/Password!' });
            } else {
                const hash = res.password;
                bcrypt.compare(password, hash, (err, resp) => {
                    if (resp != true) {
                        response.render("login", { alert: 'Incorrect Username/Password!' });
                    } else if (resp == true) {
                        req.session.user = req.body.email;
                        User.findOne({ username: req.session.user }, (err, res) => {

                            Food.find((err, docs) => {
                                if (!err) {
                                    response.render("dashboard", {
                                        food: docs,
                                        users: res,
                                        alert: 'Logged In Successfully!'
                                    });
                                }
                            });
                        });
                        //response.redirect("dashboard");
                    }
                })
            }
        })
    } catch (e) {
        response.render("login", { alert: 'Incorrect Username/Password!' });
    }

});

// Registration
app.get("/register", (req, res) => {
    res.render("register");
});

app.post("/register", (req, res) => {

    const usernam = req.body.email;
    const password = req.body.password;
    const fname = req.body.fname;
    const lname = req.body.lname;
    const gender = req.body.gender;
    const mobile = req.body.mobile;
    const address = req.body.address;


    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log(err);
        } else {
            const hashedPassword = hash;
            const instance = new User();
            instance.username = usernam;
            instance.password = hashedPassword;
            instance.fname = fname;
            instance.lname = lname;
            instance.gender = gender;
            instance.mobile = mobile;
            instance.address = address;


            instance.save((err) => {
                if (err) {
                    console.log(err);
                } else {
                    res.render("login", { alert: 'Registered Successfully!' });
                }
            });
        }
    });

});

// Dashboard
app.get("/dashboard", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        User.findOne({ username: req.session.user }, (err, res) => {

            Food.find((err, docs) => {
                if (!err) {
                    resp.render("dashboard", {
                        food: docs,
                        users: res,
                        alert: ''
                    });
                }
            });
        });
    } else {
        resp.redirect("/login");
    }
});

// Profile
app.get("/profile", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        User.findOne({ username: req.session.user }, (err, res) => {
            resp.render("profile", {
                users: res
            });
        });
    } else {
        resp.redirect("/login");
    }
});

// Edit Profile
app.post("/editprofile", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        const fname = req.body.fname;
        const lname = req.body.lname;
        const mobile = req.body.mobile;
        const address = req.body.address;

        User.updateOne({ username: req.session.user }, {
            $set: {
                fname: fname,
                lname: lname,
                mobile: mobile,
                address: address
            }
        }, (err, docs) => {
            if (!err) {
                resp.redirect("/profile");
            } else {
                console.log(err);
            }
        });
    } else {
        resp.redirect("/login");
    }
});

// Menu
app.get("/browse", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        Food.find((err, docs) => {
            if (!err) {
                resp.render("browse", {
                    food: docs,
                    alert: ''
                });
            }
        });
    } else {
        resp.render("login", { alert: 'Please Login/Register!' });
    }
});


// My Plate
app.post("/addtocart/:id", (req, resp) => {
    const id = req.params.id;

    User.findOne(
        { username: req.session.user, "cart._id": id }, (err, docs) => {
            if (!docs) {
                Food.findOne({ _id: id }, (err, docs) => {

                    User.updateOne({ username: req.session.user }, { $push: { cart: { _id: id, docs, qty: 1 } } }, (err, res) => {

                        if (!err) {
                            resp.redirect("/browse");
                        }
                    })
                });
            } else {

                Food.find((err, docs) => {
                    if (!err) {
                        resp.render("browse", {
                            food: docs,
                            alert: 'Item already Added to plate!'
                        });
                    }
                });
                //resp.redirect("/browse");
            }
        })
})

app.get("/plate", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        User.findOne({ username: req.session.user }, (err, docs) => {
            if (!err) {
                if (docs.cart.length == 0) {
                    resp.redirect("/browse");
                } else {
                    resp.render("plate", { cart: docs.cart });
                }
            } else {
                console.log(err);
            }
        });
    } else {
        resp.render("login", { alert: 'Incorrect Username/Password!' });
    }
})


// Remove From Cart
app.post("/cartremove/:id", (req, res) => {
    const i = req.params.id;

    User.updateOne({ username: req.session.user }, { $pull: { cart: { _id: i } } }, (err, docs) => {
        if (!err) {
            res.redirect("/plate");
        } else {
            console.log(err)
        }
    })
});

// Decreasing Quantity in the Cart
app.post("/qtyplus/:id", (req, res) => {
    const i = req.params.id;

    let qty = req.body.invQty

    qty = Number(qty)

    User.updateOne(
        { username: req.session.user, "cart._id": i },
        { $set: { "cart.$.qty": qty + 1 } }, (err, docs) => {
            if (!err) {
                // console.log(docs)
                res.redirect("/plate")
            } else {
                console.error(err)
            }
        })

})

// Increase Quantity in the Cart 
app.post("/qtyminus/:id", (req, res) => {
    const i = req.params.id;

    let qty = req.body.invQty

    qty = Number(qty)

    if (qty == 1) {
        User.updateOne({ username: req.session.user }, { $pull: { cart: { _id: i } } }, (err, docs) => {
            if (!err) {
                res.redirect("/plate");
            } else {
                console.log(err)
            }
        })
    } else {
        User.updateOne(
            { username: req.session.user, "cart._id": i },
            { $set: { "cart.$.qty": qty - 1 } }, (err, docs) => {
                if (!err) {
                    // console.log(docs)
                    res.redirect("/plate")
                } else {
                    console.error(err)
                }
            })
    }
})

// Place Order 
app.post("/placeorder", (req, res) => {
    User.findOne({ username: req.session.user }, (err, docs) => {
        const email = req.session.user;
        const items = docs.cart;
        const time = new Date();

        // Calculating Price from database 
        var total = 0;
        for (let i = 0; i < docs.cart.length; i++) {
            total = total + (docs.cart[i].docs.itemPrice * docs.cart[i].qty);
        }

        const status = "in progress";

        const instance = new Order();

        instance.userEmail = email;
        instance.Items = items;
        instance.OrderDateTime = time;
        instance.GrandTotal = Number(total);
        instance.OrderStatus = status;

        instance.save((err) => {
            if (err) {
                console.log(err);
            } else {
                User.updateOne({ username: req.session.user }, { $set: { 'cart': [] } }, (err, docs) => {
                    if (!err) {
                        res.redirect("/orders")
                    }
                })
            }
        })


    })
})

app.get("/orders", (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        Order.find({ userEmail: req.session.user, OrderStatus: "in progress" }, (err, docs) => {
            if (!err) {
                res.render("orders", { ord: docs })
            } else {
                res.redirect("/browse")
            }
        })
    } else {
        res.redirect("/login");
    }
})

app.get("/custorderhist", (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        Order.find({ userEmail: req.session.user, OrderStatus: "completed" }, (err, docs) => {
            if (!err) {
                res.render("custorderhist", { orders: docs })
            } else {
                res.redirect("/browse")
            }
        })
    } else {
        res.redirect("/login");
    }
})


// Cancle Order
app.post("/cancelorder/:id", (req, res) => {
    const id = req.params.id;
    Order.deleteOne({ _id: id }, (err, docs) => {
        if (!err) {
            res.redirect("/orders");
        } else {
            console.error(err);
        }
    })
})

// About Us
app.get("/aboutus", (req, res)=>{
    res.render("aboutus")
})


// Admin/Restaurant Endpoint

// Login
app.get("/restaurant", restsessionchecker, (req, res) => {
    res.render("restaurant");
});

app.post("/rlogin", (req, resp) => {
    const email = req.body.email;
    const password = req.body.password;

    Restaurant.findOne({ email: email }, (err, res) => {
        if (password == res.password) {
            req.session.restaurant = email
            resp.redirect("admindash");
        } else {
            resp.redirect("restaurant");
        }
    })
})

// Admin dashboard
app.get("/admindash", (req, res) => {
    if (req.session.restaurant && req.cookies.user_sid) {
        res.render("admindash");
    } else {
        res.redirect("restaurant")
    }
})

// User Manage Page
app.get("/users", (req, res) => {
    if (req.session.restaurant && req.cookies.user_sid) {
        User.find((err, docs) => {
            if (!err) {
                res.render("users", { users: docs });
            } else {
                console.error(err);
            }
        })
    } else {
        res.redirect("restaurant")
    }
})

// Deleting Users
app.post("/deleteuser/:id", (req, res) => {
    const id = req.params.id

    User.findByIdAndDelete({ _id: id }, (err, docs) => {
        if (!err) {
            res.redirect("/users")
        } else {
            console.error(err);
        }
    })
})

// Orders Manage Page
app.get("/userorders", (req, res) => {
    if (req.session.restaurant && req.cookies.user_sid) {
        Order.find({ OrderStatus: "in progress" }, (err, docs) => {
            if (!err) {
                res.render("userorders", { orders: docs });
            } else {
                console.log(err)
            }
        })
    } else {
        res.redirect("restaurant")
    }
})

// Update Orders
app.post("/updateorder/:id", (req, res) => {
    const id = req.params.id;
    Order.updateOne({ _id: id }, { $set: { 'OrderStatus': "completed" } }, (err, docs) => {
        if (!err) {
            res.redirect("/userorders")
        } else {
            console.log(err)
        }
    })
})

// Orders History Page
app.get("/history", (req, res) => {
    if (req.session.restaurant && req.cookies.user_sid) {
        Order.find({ OrderStatus: "completed" }, (err, docs) => {
            if (!err) {
                res.render("history", { orders: docs });
            } else {
                console.log(err)
            }
        })
    } else {
        res.redirect("restaurant")
    }
})

// Adding New Item
app.post("/addfood", (req, res) => {
    const itemName = req.body.itemname;
    const item = req.body.item;
    const type = req.body.type;
    const price = req.body.price;
    const url = req.body.itemurl;

    const instance = new Food();
    instance.itemName = itemName;
    instance.FoodItem = item;
    instance.itemType = type;
    instance.itemPrice = price;
    instance.itemurl = url;

    instance.save((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/food");
        }
    });
});

// Item List
app.get("/food", (req, res) => {

    if (req.session.restaurant && req.cookies.user_sid) {
        Food.find((err, docs) => {
            if (!err) {
                res.render("foods", {
                    food: docs
                });
            }
        });
    } else {
        res.redirect("restaurant");
    }
});

// Deleting Item
app.post("/deletefood/:id", (req, res) => {
    const id = req.params.id;
    Food.findByIdAndDelete({ _id: id }, (err, docs) => {
        if (!err) {
            res.redirect("/food");
        }
    });
});

// Update Item
app.post("/updatefood", (req, res) => {
    const id = req.body.foodId;
    const itemname = req.body.itemname;
    const fooditem = req.body.fooditem;
    const type = req.body.type;
    const price = req.body.price;

    Food.updateOne({ _id: id }, {
        $set: {
            itemName: itemname,
            FoodItem: fooditem,
            itemType: type,
            itemPrice: price
        }
    }, (err, docs) => {
        if (!err) {
            res.redirect("/food");
        } else {
            console.log(err);
        }
    })
})


// Logout

// User Logout
app.get("/logout", (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie("user_sid");
        res.redirect("/");
    } else {
        res.redirect("/");
    }
});


// Admin/Restaurant Logout
app.get("/rlogout", (req, res) => {
    if (req.session.restaurant && req.cookies.user_sid) {
        res.clearCookie("user_sid");
        res.redirect("restaurant");
    } else {
        res.redirect("restaurant");
    }
});

// Start Server
app.listen(process.env.PORT || 3000, () => console.log("Server started at port 3000"));