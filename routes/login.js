const express = require("express");
const passport = require("passport");
const bcrypt = require("bcrypt");
const User = require("../models/User");
const app = express();

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }, (err, user) => {
    if (err) throw err;
    else if (user)
      return res.status(400).send("User with this mail already exists");

    bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
      if (err) throw err;

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
      });

      newUser.save((err, user) => {
        if (err) throw err;
      });
    });
    res.status(200).send("new user added");
    res.redirect("/login");
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

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
  console.log(`-------> User Logged out`);
});
