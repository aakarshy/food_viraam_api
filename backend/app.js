const express = require("express");
const app = express();
var morgan = require("morgan");
const bodyParser = require("body-parser")
const mongoose = require("mongoose")
const dotenv = require("dotenv")
const expressValidator = require("express-validator")
const cookieParser = require("cookie-parser")
const fs = require('fs')
const cors = require('cors')
const methodOverride = require("method-override")

app.use(cors());
app.use(methodOverride("_method"))
dotenv.config()

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});


mongoose.connect(process.env.MONGO_URI,{useNewUrlParser: true,useUnifiedTopology: true })
.then(() => console.log("connection successful"));

mongoose.connection.on("error", err => {
	console.log("DB connection error:" + err.message);
})
//routes
const authRoutes = require('./routes/auth')
const userRoutes = require('./routes/user')

 
 //apiDocs
 app.get("/api",(req, res) => {
 	fs.readFile('docs/apiDocs.json', (err, data) => {
 		if(err) {
 			res.status(400).json({
 				error: err
 			})
 		}
 		const docs = JSON.parse(data)
 		res.json(docs)
 	})
 })

//middleware
app.use(morgan('dev'));
app.use(bodyParser.json());
app.use(expressValidator());
app.use(cookieParser());

 
app.use("/api", authRoutes);
app.use("/api", userRoutes);

app.use(function(err, req, res, next){
	if(err.name === "UnauthorizedError"){
		res.status(401).json({
			error: "Unauthorized"
		})
	}

})


const port = process.env.PORT || 8080;
app.listen(port, ()=>{
	console.log('server up on port:' + port);
}); 