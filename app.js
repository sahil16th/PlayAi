// Adding Libraries
const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const path = require("path");
const session = require("express-session");
const crypto = require('crypto');
const port = 3000;

const app = express();



require('dotenv').config(); // Load environment variables from .env file




const mongoapi = process.env.MONGO_URL;



// Connecting to Database
mongoose.connect(mongoapi)
.then(() => {
  console.log("Connected to MongoDB Atlas");
})
.catch((error) => {
  console.error("Error connecting to MongoDB Atlas:", error);
});


// Adding Middlewares 
app.use(bodyParser.urlencoded({
  extended: true
}));

const secretKey = crypto.randomBytes(32).toString('hex');

app.use(session({
  secret: secretKey,
  resave: false,
  saveUninitialized: true,
}));

// Middleware to prevent caching
app.use((req, res, next) => {
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
});

// creating the path
const indexPath = path.join(__dirname, "Frontend/index.html");
const loginPath = path.join(__dirname, "Frontend/login.html");
const registrationPath = path.join(__dirname, "Frontend/registration.html");
const dashboardPath = path.join(__dirname, "Frontend/dashboard.html");
const NotfoundPath = path.join(__dirname, "Frontend/Notfound.html");

// Giving routes
app.get("/", (req, res) => {
  res.sendFile(indexPath);
});

app.get("/login", (req, res) => {
  res.sendFile(loginPath);
});

app.get("/register", (req, res) => {
  res.sendFile(registrationPath);
});

app.get("/dashboard", (req, res) => {
  if (req.session.user) {
    res.sendFile(dashboardPath);
  } else {
    res.redirect('/');
  }
});

app.get("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error(err);
    } else {
      res.redirect('/');
    }
  });
});

app.get("*",(req,res) =>{
  res.sendFile(NotfoundPath)
})

// Structure of login
const loginSchema = new mongoose.Schema({
  email: String,
  password: String
});

// Login process
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Person.findOne({ email, password });
    if (user) {
      req.session.user = user;
      res.redirect('/dashboard');
    } else {
      res.send("Invalid Authentication");
    }
  } catch (error) {
    console.log("Internal Server Error");
    res.send("Internal Error");
  }
});

// Structure of registration page
const clientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true
  },
  password: {
    type: String,
    required: true
  }
});

// Registration process
app.post("/register", async (req, res) => {
  const { name, location, email, password } = req.body;

  try {
    const user = await client.create({ name, location, email, password });
    if (user) {
      res.redirect('/dashboard')
    } else {
      res.send("error");
    }
  } catch (error) {
    console.log("Internal Error");
    res.send("Email is already exist");
  }
});

// Selecting the collection in the database
const Person = mongoose.model('Person', loginSchema, 'people');
const client = mongoose.model('client', clientSchema, 'people');

app.listen(port, () => {
  console.log(`Server is listening on port number ${port}`);
})