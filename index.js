require("dotenv").config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const passport = require('passport');
const session = require('express-session');
const passportLocalMongoose = require('passport-local-mongoose');

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

const mongoose = require('mongoose');
mongoose.connect(process.env.connect, { UseNewUrlParser: true });
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))


const customerSchema = new mongoose.Schema({
    username: {
        unique: true,
        type: String,
        required: true
        // username:notnull,
    },
    password: {
        required: true,
        type: String
    }
});

customerSchema.plugin(passportLocalMongoose);

const Customer = new mongoose.model("Customer", customerSchema);

passport.use(Customer.createStrategy());

passport.serializeUser(Customer.serializeUser());
passport.deserializeUser(Customer.deserializeUser());


app.get("/", function (req, res) {
    res.send("Started");
});

app.get("/loginform", function (req, res) {
    res.render("loginForm.ejs");
});

app.post('/register', function (req, res) {
    // res.render('register.ejs')
    // res.send({ name: req.body.logname, email: req.body.logemail, pass: req.body.logpass })
    // res.send(req.body.logname)

    // res.render('register.ejs', {
    //     name: req.body.logname,
    //     email: req.body.logemail,
    //     pass: req.body.logpass
    // })


    const customer = new Customer({
        username: req.body.logemail,
        password: req.body.logpass
    });

    Customer.register({ username: req.body.logemail }, req.body.logpass, function (err, customer) {
        if (err) {
            console.log(err);
            //res.redirect("/signup");
        } else {
            res.send(customer);
        }
    });
});


app.listen(3000, function () {
    console.log("Server started at port 3000");
});