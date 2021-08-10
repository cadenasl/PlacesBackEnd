const express = require("express");
require("dotenv").config();
const HttpError = require("./Models/http-error");
const userRoutes = require("./routes/user-route");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");
//gives us the ability to interact with our file system

const placeRoutes = require("./routes/place-route");
//imports place routes to use

const app = express();
//creates an express app
app.use(express.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));
//renders images folder if requested through uploads/images

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PATCH,DELETE");
  next();
});
//imports the build in express body parser and tells the data will be encoded json data
app.use("/api/places", placeRoutes);
//place routes have a starting route of /api/places
app.use("/api/users", userRoutes);
app.use((req, res, next) => {
  const error = new HttpError("Page could not be found", 404);
  throw error;
});
app.use((error, req, res, next) => {
  //error handling middleware
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headersSent) {
    return next(error);
    //if a request is already sent we forward the error to the default error handling function and stops the rest of the code from running
  }
  res.status(error.code || 500);
  //sets error code to an error code given or the automactic 500

  res.json({ message: error.message || "an unknown error has occured" });
  //sends the error with a message that was given or a predefined message
});
mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.u5bge.mongodb.net/${process.env.DB_DATABASE}?retryWrites=true&w=majority`
  )
  .then(app.listen(5000))
  .catch((error) => {
    console.log(error);
  });

//listens to local host 5000
