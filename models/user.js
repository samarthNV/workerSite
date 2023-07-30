const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    prof: String,
})

const User = mongoose.model("User-info", userSchema);

module.exports = User;