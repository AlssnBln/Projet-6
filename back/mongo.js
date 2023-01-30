const mongoose = require('mongoose');
const uniqueValidator = require("mongoose-unique-validator")
const uri = 'mongodb+srv://Alisson_Bln:496r4XbpyApsb2Rk@atlascluster.acvs5ht.mongodb.net/?retryWrites=true&w=majority';

mongoose
.connect(uri)
.then(()=> console.log("Connected to Mongo!"))
.catch(err => console.error("Error connecting to Mongo: ", err))

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
})
userSchema.plugin(uniqueValidator)

const User = mongoose.model("User", userSchema)

module.exports = {mongoose, User}