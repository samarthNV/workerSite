const mongoose = require("mongoose");

const preTaskSchema = new mongoose.Schema({
    task: String,
    domain: String,
    description: String,
    todate: String,
  })

const PreTask = mongoose.model("PreTask-info", preTaskSchema);

module.exports = PreTask;