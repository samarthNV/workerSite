const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const path = require('path');
const _ = require("lodash");

const User = require('./models/user');
const Task = require('./models/task');
const Work = require('./models/work');
const PreTask = require('./models/preTask');

const port_no =  process.env.PORT || 27017;

mongoose.connect("mongodb://127.0.0.1:27017/", {
  dbName: "WorkerConnect",
})
.then(() => {console.log("Database Connected.")})
.catch((e) => {console.log(e)});

const app = express();

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
app.use(cookieParser());

var person = 0;

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
    res.render("clients/clientHome");
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
    res.render("clients/clientProfile", {
      name: person.name, 
      email: person.email,
      prof: person.prof,
    });
})

app.get("/notifications", async (req, res) => {
  let taskArray = await Task.find();
    res.render("clients/clientNotify", {
      taskArray: taskArray,
      message: "Your task was successfully uploaded !",
    });
})

app.get("/tasks", async (req, res) => {
    let taskArray = await Task.find();
    let previousTask = await PreTask.find();
    res.render("clients/clientTasks", {
        taskArray: taskArray,
        previousTask: previousTask,
    });
})

app.get("/addTask", (req, res) => {
    res.render("clients/clientAddTask");
})

app.get("/taskName/:taskNames", async function(req, res){
  let taskName = _.lowerCase(req.params.taskNames);
  let taskArray = await Task.find();
  taskArray.forEach(function(element){
    let btask = _.lowerCase(element.task);
    if(btask === taskName){
      res.render("clients/task", {
        taskName: element.task,
        domainName: element.domain,
        descName: element.description,
        dateName: element.todate.substring(4, 24),
      })
    }
  })
})

app.get("/taskWorker/:taskNames", async function(req, res){
  let taskName = _.lowerCase(req.params.taskNames);
  let taskArray = await Task.find();
  taskArray.forEach(function(element){
    let btask = _.lowerCase(element.task);
    if(btask === taskName){
      res.render("workers/task", {
        taskName: element.task,
        domainName: element.domain,
        descName: element.description,
        dateName: element.todate.substring(4, 24),
      })
    }
  })
})

app.get("/homeWorker", isAuthenticated, async (req, res) => {
  let taskArray = await Task.find();
  res.render("workers/workerHome", {
    taskArray: taskArray,
  });
})

app.get("/profileWorker", (req, res) => {
  res.render("workers/workerProfile", {
    name: person.name, 
    email: person.email,
    prof: person.prof,
  });
})

app.get("/notificationsWorker", async (req, res) => {
let wTask = await Work.find();
  res.render("workers/workerNotify", {
    wTask: wTask,
    message: "You have applied for the task.",
  });
})

app.get("/work", async (req, res) => {
  let wTask = await Work.find();
  res.render("workers/workerWork", {
      wTask: wTask,
  });
})

app.post("/login", async (req, res) => {
    const { emaill, passwordl, profl } = req.body;
  
    let user = await User.findOne({email : emaill });
  
    if (!user) return res.redirect("/register");
  
    const isMatch = await bcrypt.compare(passwordl, user.password);
  
    if (!isMatch)
      return res.render("login", { email : emaill, message: "Incorrect Password" });

    if ( _.lowerCase(profl) != _.lowerCase(user.prof))
      return res.render("login", { email : emaill, message: "Incorrect Profession" });
  
    const token = jwt.sign({ _id: user._id }, "secretKey");
  
    res.cookie("token", token, {
      httpOnly: true,
      expires: new Date(Date.now() + 100 * 1000),
    });

    if( _.lowerCase(profl) === "client"){
      res.redirect("/home");
    }else{
      res.redirect("/homeWorker");
    }
    
  });

app.post("/register", async (req, res) => {
    const { name, email, password, prof } = req.body;
  
    let user = await User.findOne({email : email });
    if (user) {
      return res.redirect("/login");
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    if (_.lowerCase(prof) == "worker" || _.lowerCase(prof) == "client"){
      user = await User.create({
        name,
        email,
        password: hashedPassword,
        prof,
      });
      res.redirect("/login");
    }else{
      return res.render("register", { name : name, email : email, message: "Only Client or Worker" });
    }
      
});

app.post("/tasks", async (req, res) => {
    const {task, domain, description} = req.body;
    let textdate = new Date(Date.now());
    let todate = textdate.toString();
    todate = todate.substring(4, 24);

    ntask = await Task.create({
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

app.post("/taskAdd", async (req, res) => {
  let mark = req.body.mark;
  let prtask = await Task.findOne({task : mark});
  let textdate = new Date(Date.now());
  let ntodate = textdate.toString();
  ntodate = ntodate.substring(4, 24);
  prtask.todate = ntodate;
  wTask = await workerTask.insertMany(prtask);
  res.redirect("/work");
})

app.listen( port_no, () => {
    console.log("Server has started on PORT 27017");
})