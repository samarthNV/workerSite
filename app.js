const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt")
const date = require(__dirname + "/date.js");

const port_no =  process.env.PORT || 27017;

mongoose.connect("mongodb://127.0.0.1:27017/", {
    dbName: "WorkerConnect",
})
.then(() => {console.log("Database Connected.")})
.catch((e) => {console.log(e)});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
})

const taskSchema = new mongoose.Schema({
    task: String,
    domain: String,
    description: String,
    todate: String,
})

const preTaskSchema = new mongoose.Schema({
  task: String,
  domain: String,
  description: String,
  todate: String,
})

const User = mongoose.model("User-info", userSchema);
const Task = mongoose.model("Task-info", taskSchema);
const PreTask = mongoose.model("PreTask-info", preTaskSchema);

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

let person = 0;

const isAuthenticated = async (req, res, next) => {
    const { token } = req.cookies;
    if (token) {
        const decoded = jwt.verify(token, "secretKey");
        person = await User.findById(decoded._id);
        next();
    } else {
      res.redirect("/login");
    }
  };

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
    res.render("clientProfile", {
      name: person.name, 
      email: person.email,
    });
})

app.get("/notifications", async (req, res) => {
  let taskArray = await Task.find();
    res.render("clientNotify", {
      taskArray: taskArray,
      message: "Your task was successfully uploaded !",
    });
})

app.get("/tasks", async (req, res) => {
    let taskArray = await Task.find();
    let previousTask = await PreTask.find();
    res.render("clientTasks", {
        taskArray: taskArray,
        previousTask: previousTask,
    });
})

app.get("/addTask", (req, res) => {
    res.render("clientAddTask");
})

app.post("/login", async (req, res) => {
    const { emaill, passwordl } = req.body;
  
    let user = await User.findOne({email : emaill });
  
    if (!user) return res.redirect("/register");
  
    const isMatch = await bcrypt.compare(passwordl, user.password);
  
    if (!isMatch)
      return res.render("login", { email : emaill, message: "Incorrect Password" });
  
    const token = jwt.sign({ _id: user._id }, "secretKey");
  
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 100 * 1000),
    });
    res.redirect("/home");
  });

app.post("/register", async (req, res) => {
    const { name, email, password } = req.body;
  
    let user = await User.findOne({email : email });
    if (user) {
      return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
  
    user = await User.create({
      name,
      email,
      password: hashedPassword,
    });
  
    const token = jwt.sign({ _id: user._id }, "secretKey");
  
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 100 * 1000),
    });
    res.redirect("/home");
});

app.post("/tasks", async (req, res) => {
    const {task, domain, description} = req.body;
    let textdate = new Date(Date.now());
    let todate = textdate.toString();
    todate = todate.substring(4, 24);
    console.log(todate);

    task = await Task.create({
        task,
        domain,
        description,
        todate,
    });

    res.redirect("/tasks");

})

app.post("/taskPrev", async (req, res) => {
  let mark = req.body.mark;
  let prtask = await Task.findOne({task : mark});
  preTask = await PreTask.insertMany(prtask);
  task = await Task.deleteOne({task : mark});
  res.redirect("/tasks");
})

app.get("/task/:taskNames", function(req, res){
    let taskName = _.lowerCase(req.params.taskNames);
    tasks.forEach(function(element){
      let bTitle = _.lowerCase(element.title);
      if(bTitle === postName){
        res.render("post", {
          blogTitle: element.title,
          blogContent: element.content,
        })
      }
    })
  })

app.listen( port_no, () => {
    console.log("Server has started on PORT 27017");
})