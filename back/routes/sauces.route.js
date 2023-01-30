const express = require("express")
const { authenticateUser } = require("../middleware/auth")
const { theSauces, createSauce, theSauceId, deleteSauce, modifySauce, likeSauce } = require("../controllers/sauces")
const multer = require("../middleware/multer")
const saucesRoute = express.Router()
const bodyParser = require("body-parser")

saucesRoute.use(bodyParser.json())
saucesRoute.use(authenticateUser)

saucesRoute.get("/", theSauces)
saucesRoute.get("/:id", theSauceId)
saucesRoute.delete("/:id", multer, deleteSauce)
saucesRoute.put("/:id", multer, modifySauce);
saucesRoute.post("/", multer, createSauce);
saucesRoute.post("/:id/like", likeSauce)

module.exports = {saucesRoute}