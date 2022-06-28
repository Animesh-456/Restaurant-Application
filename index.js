const express = require('express');
const app = express();
app.set("view engine","ejs");
app.set("views",__dirname+"/views");
app.use(express.static('public'));
app.get("/", function (req, res) {
    res.send("Started");
});

app.get("/login", function (req, res) {
    res.render("login.ejs");
});

app.listen(3000, function () {
    console.log("Server started at port 3000");
});