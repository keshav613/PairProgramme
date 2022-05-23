const LocalStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");
const User = require("../models/User");

module.exports = (passport) => {
  passport.use(
    new LocalStrategy((user, password, done) => {
      User.findOne({ email: user }, (err, user) => {
        if (err) return done(err, false);
        else if (!user) return done("User does not exist, pls register", false);

        bcrypt.compare(password, user.password, async (err, result) => {
          if (err) return done(err, false);
          if (result) return done(null, result);
          else return done("Incorrect password", false);
        });
      });
    })
  );

  passport.serializeUser((user, done) => {
    return done(null, user);
  });

  passport.deserializeUser((user, done) => {
    return done(null, user);
  });
};
