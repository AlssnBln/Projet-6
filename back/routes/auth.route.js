const {createUser, logUser} = require("../controllers/user")

const express = require("express")
const authRoute = express.Router()

authRoute.post("/signup", createUser)
authRoute.post("/login", logUser)

module.exports = {authRoute}