const express = require("express");
const app = express();
const passport = require("passport");

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
  })
);

const checkLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) {
    return res.redirect("/dashboard");
  }
  next();
};

app.get("/dashboard", checkLoggedIn, (req, res) => {
  res.render("dashboard.ejs", { name: req.user.name });
});

app.delete("/logout", (req, res) => {
  req.logOut();
  res.redirect("/login");
  console.log(`-------> User Logged out`);
});
