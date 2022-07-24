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
    password: {
        type: String,

    }
});

const User = new mongoose.model("User", customerSchema);


app.use((req, res, next) => {
    if (req.cookies.user_sid && !req.session.user) {
      res.clearCookie("user_sid");
    }
    next();
  });
   
  // middleware function to check for logged-in users
  var sessionChecker = (req, res, next) => {
    if (req.session.user && req.cookies.user_sid) {
      res.redirect("dashboard");
    } else {
      next();
    }
  };

app.get("/login", sessionChecker, (req, res) => {
    //console.log(req.session.user);
    res.render("login");
});

app.post("/login", (req, response) => {

    const usernam = req.body.email;
    const password = req.body.password;

    try {
        const instance = User.findOne({ username: req.body.email }, (err, res) => {
            if (err) {
                console.log(err);
            } else {
                console.log(res);
                //console.log("The encrypted password :- ", res.password);

                const hash = res.password;
                bcrypt.compare(req.body.password, hash, (err, resp) => {
                    if (err) {
                        console.log(err);
                    } else {
                        if (resp != true) {
                            //alert('Incorrect Username or Password!');
                            //window.location = 'login.ejs';
                            console.log("Incorrect Password!");
                        }

                        req.session.user = req.body.email;
                        
                        response.redirect("dashboard");
                    }
                });

            }
        });
    } catch (e) {
        console.log("Error Occured!");
    }


    // if (instance) {
    //     const hash = instance.password;
    //     console.log("Database Password: - ", hash);
    //     console.log(instance);
    //     bcrypt.compare(password, hash, function (err, result) {
    //         if (err) {
    //             console.log("Incorrect Password !");
    //         } else {
    //             console.log("Logged in Successfully !");
    //         }
    //     });
    // }else{
    //     console.log(instance);
    // }
});

app.get("/register", (req, res) => {
    res.render("register.ejs");
});

app.post("/register", (req, res) => {

    const usernam = req.body.email;
    const password = req.body.password;

    //console.log(usernam, password);



    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.log(err);
        } else {
            const hashedPassword = hash;
            const instance = new User();
            instance.username = usernam;
            instance.password = hashedPassword;

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



app.get("/dashboard", (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.render("dashboard");
      } else {
        res.redirect("/login");
      }
});

app.post("/logout", (req, res) => {
    if (req.session.user && req.cookies.user_sid) {
        res.clearCookie("user_sid");
        res.redirect("login");
      } else {
        res.redirect("login");
      }
});

app.listen(3000, (req, res) => {
    console.log("Server started at port 3000");
});