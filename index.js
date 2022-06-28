const express = require('express');
const bodyParser = require('body-parser')


const app = express();

app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static('public'));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: false }))



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
    res.render('register.ejs', {
        name: req.body.logname,
        email: req.body.logemail,
        pass: req.body.logpass
    })

});


app.listen(3000, function () {
    console.log("Server started at port 3000");
});