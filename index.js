const express = require('express');
const bodyParser = require('body-parser')


const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static('public'));
//app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))

const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
require("dotenv").config();

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect(process.env.connect, { UseNewUrlParser: true });

// const db = mongoose.connection
// db.on('error', error => console.error(error))
// db.once('open', () => console.log('Connected to Mongoose'))

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

customerSchema.plugin(passportLocalMongoose);

const User = new mongoose.model("User", customerSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.send("Started");
});

app.get("/loginform", function (req, res) {
    res.render("loginForm.ejs");
});

app.get("/dash", function(req, res){
    if(req.isAuthenticated()){
        res.render("dash.ejs");
    }else{
        res.render("loginForm.ejs");
    }
})

app.post('/register', function (req, res) {

    console.log(req.body.logpass);
    console.log(req.body.logemail);
    // res.render('register.ejs')
    // res.send({ name: req.body.logname, email: req.body.logemail, pass: req.body.logpass })
    // res.send(req.body.logname)

    // res.render('register.ejs', {
    //     name: req.body.logname,
    //     email: req.body.logemail,
    //     pass: req.body.logpass
    // })


    const user = new User({
        username: req.body.logemail,
        password: req.body.logpass
    });

    User.register({ username: req.body.logemail }, req.body.logpass, function (err, user) {
        if (err) {
            console.log(err);
            //res.redirect("/signup");
        } else {
            // passport.authenticate("local")(req, res, function(){
            // res.render("dash");
            // });
            res.render("loginForm.ejs");
        }
    });
});

app.post("/login", function(req, res){
    res.render("dash");
});


app.listen(3000, function () {
    console.log("Server started at port 3000");
});