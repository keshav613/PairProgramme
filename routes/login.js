const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const app = express();
const router = express.Router();

router.get("/", (req, res) => {
  res.render("index");
});

router.get("/dashboard", (req, res) => {
  if (req.isAuthenticated()) res.render("dashboard");
  else res.send(400);
});

router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

router.get("/register", (req, res) => {
  res.render("register");
});

router.post("/registerNew", (req, res) => {
  console.log("NEW registration POSt request");
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;
    else if (user) return;
    console.log(req.body.email + " " + req.body.password);
    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) throw err;

      const newUser = new User({
        email: req.body.email,
        password: hashedPassword,
      });

      newUser.save((err, user) => {
        if (err) throw err;
        console.log("NEW user saved in DB");
      });
    });
    // res.status(200).send("new user added");
    res.redirect("/");
  });
});

router.get(
  "/api/auth/google",
  passport.authenticate("google", { scope: ["email", "profile", "openid"] })
);

router.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

router.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
  console.log(`-------> User Logged out`);
});

module.exports = router;
