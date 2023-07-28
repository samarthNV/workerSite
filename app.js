const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const date = require(__dirname + "/date.js");

const port_no = 27017;

mongoose.connect("mongodb://127.0.0.1:27017/", {
    dbName: "WorkerConnect",
})
.then(() => {console.log("Database Connected.")})
.catch((e) => {console.log(e)});

const userSchema = new mongoose.Schema({
    email: String,
    password: String,
})

const User = mongoose.model("User-info", userSchema);

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

const isAuthenticated = async (req, res, next) => {
    const {token} = req.cookies;
    if(token){
        const decode = jwt.verify(token, "secretKey");
        req.user = await User.findById(decoded._id);
        next();
    }else{
        res.render("login"); 
    }
}

app.get("/home", isAuthenticated, (req, res) => {
    res.render("clientHome");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/logout", (req, res) => {
    res.cookie("token", null, {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.redirect("/login");
})

app.get("/register", (req, res) => {
    res.render("register");
})

app.get("/profile", (req, res) => {
    res.render("clientProfile");
})

app.get("/notifications", (req, res) => {
    res.render("clientNotify");
})

app.get("/tasks", (req, res) => {
    res.render("clientTasks");
})

app.get("/addTask", (req, res) => {
    res.render("clientAddTask");
})

app.post("/home", async (req, res) => {
    const {email, password} = req.body;
    const user = await User.create({
        email,
        password,
    });
    const token = jwt.sign({_id: user._id}, "secretKey");

    res.cookie("token", token, {
        httpOnly:true,
        expires: new Date(Date.now() + 40*1000),
    })
    res.redirect("/home");
})

// app.post("/login", async)

app.listen( port_no, () => {
    console.log("Server has started on PORT 27017");
})