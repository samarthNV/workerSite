const mongoose = require("mongoose");

const workTask = new mongoose.Schema({
    task: String,
    domain: String,
    description: String,
    todate: String,
  })

const workerTask = mongoose.model("Work-info", workTask);

module.exports = workerTask;