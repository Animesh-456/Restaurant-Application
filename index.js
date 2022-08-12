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
mongoose.connect(process.env.connect, { UseNewUrlParser: true });

const customerSchema = new mongoose.Schema({
    username: {
        unique: true,
        type: String,
        required: true
        // username:notnull,
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


const User = new mongoose.model("User", customerSchema);
const Food = new mongoose.model("Food", foodSchema);
const Restaurant = new mongoose.model("Restaurant", restaurantSchema);
const order = new mongoose.model("Order", orderSchema);

app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user && !req.session.restaurant) {
        res.clearCookie("user_sid");
    }
    next();
});




// middleware function to check for logged-in users
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
/*-----------------Customer Endpoint-----------------------------*/

app.get("/", (req, res) => {
    Food.find((err, docs) => {
        if (!err) {
            res.render("home", {
                food: docs
            });
        }
    });
})


app.get("/login", sessionChecker, async (req, res) => {

    res.render("login");
});

app.post("/login", async (req, response) => {

    const usernam = req.body.email;
    const password = req.body.password;

    try {

        User.findOne({ username: usernam }, (err, res) => {
            if (!res) {
                response.redirect("login");
            } else {
                const hash = res.password;
                bcrypt.compare(password, hash, (err, resp) => {
                    if (resp != true) {
                        response.redirect("login");
                    } else if (resp == true) {
                        req.session.user = req.body.email;
                        response.redirect("dashboard");
                    }
                })
            }
        })
    } catch (e) {
        response.redirect("login");
    }

});

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
                    res.redirect("login");
                }
            });
        }
    });

});


app.get("/dashboard", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        User.findOne({ username: req.session.user }, (err, res) => {

            Food.find((err, docs) => {
                if (!err) {
                    resp.render("dashboard", {
                        food: docs,
                        users: res
                    });
                }
            });
        });
    } else {
        resp.redirect("/login");
    }
});
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

app.get("/browse", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        Food.find((err, docs) => {
            if (!err) {
                resp.render("browse", {
                    food: docs,
                });
            }
        });
    } else {
        resp.redirect("/login");
    }
});

app.post("/addtocart/:id", (req, resp) => {
    const id = req.params.id;
    Food.findOne({ _id: id }, (err, docs) => {
       
        User.updateOne({ username: req.session.user }, { $push: { cart:{docs, qty: "1"} } }, (err, res) => {
           
            if (!err) {
                resp.redirect("/browse");
            }
        })
    });
})

app.get("/plate", (req, resp) => {
    if (req.session.user && req.cookies.user_sid) {
        User.findOne({ username: req.session.user }, (err, docs) => {
            if (!err) {
                
                resp.render("plate", { cart: docs.cart });
            } else {
                console.log(err);
            }
        });
    } else {
        resp.redirect("/login");
    }
})

/*------------Admin/Restaurant Endpoint------------------------*/

app.get("/restaurant", restsessionchecker, (req, res) => {
    res.render("restaurant");
});

app.post("/rlogin", (req, resp) => {
    const email = req.body.email;
    const password = req.body.password;

    Restaurant.findOne({ email: email }, (err, res) => {
        if (password == res.password) {
            req.session.restaurant = email
            resp.redirect("food");
        } else {
            resp.redirect("restaurant");
        }
    })
})


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

app.post("/deletefood/:id", (req, res) => {
    const id = req.params.id;
    Food.findByIdAndDelete({ _id: id }, (err, docs) => {
        if (!err) {
            res.redirect("/food");
        }
    });
});

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

app.get("/logout", (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie("user_sid");
        res.redirect("/");
    } else {
        res.redirect("/");
    }
});

app.get("/rlogout", (req, res) => {
    if (req.session.restaurant && req.cookies.user_sid) {
        res.clearCookie("user_sid");
        res.redirect("restaurant");
    } else {
        res.redirect("restaurant");
    }
});


app.listen(process.env.PORT || 3000, () => console.log("Server started at port 3000"));