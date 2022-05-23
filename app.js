require("dotenv").config();

const express = require("express");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const passport = require("passport");
const mongoose = require("mongoose");

const loginRouter = require("./routes/login");

const app = express();
const port = process.env.port || 3000;
//const dbstring = `mongodb+srv://${process.env.dbUsername}:${process.env.dbPassword}@cluster0.0gcba.mongodb.net/${process.env.dbName}?retryWrites=true&w=majority`;
const dbstring = "mongodb://127.0.0.1:27017";

app.use(session({ secret: "cats" }));
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
app.use(cookieParser());

mongoose
  .connect(dbstring, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(function () {
    console.log("success, connected to DB !!");
  })
  .catch(function (err) {
    console.log("no connection " + err);
  });

app.use(passport.initialize());
app.use(passport.session());

require("./auths/jwtStrategy")(passport);
require("./auths/googleAuth")(passport);

app.use("/", loginRouter);

//Expose a route for all ur features
app.use("/dashboard", checkLoggedIn, application);

app.listen(port);
