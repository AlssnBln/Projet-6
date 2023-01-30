const {app, express} = require("./server")
const {saucesRoute} = require("./routes/sauces.route")
const {authRoute} = require("./routes/auth.route")
const bodyParser = require("body-parser")
const port = 3000
const path = require("path")

// Middleware
app.use(bodyParser.json())
app.use("/api/sauces", saucesRoute)
app.use("/api/auth", authRoute)

// Connection Database
require("./mongo")

// Routes
app.get("/", (req, res) => res.send("Hello World!"))

// Listen
app.use("/images", express.static(path.join(__dirname, "images")))
app.listen(port, ()=> console.log("Listening on port " + port))

