const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    task: String,
    domain: String,
    description: String,
    todate: String,
})

const Task = mongoose.model("Task-info", taskSchema);

module.exports = Task;