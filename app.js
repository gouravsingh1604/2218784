const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
const urlRoutes = require("./routes/url");

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(urlRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => console.log("MongoDB connected"));

module.exports = app;
