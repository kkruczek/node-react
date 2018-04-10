const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');

const User = mongoose.model('users');

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id)
  .then(user => {
    done(null, user);
  });
});

passport.use(
  new GoogleStrategy({
      clientID: keys.googleClientID,
      clientSecret: keys.googleClientSecret,
      callbackURL: '/auth/google/callback'
    },
    (accessToken, refreshToken, profile, done) => {
      User.findOne({
          googleID: profile.id
        })
        .then(existingUser => {
          if (existingUser) {
            // we already have this user record in db - do not register
            done(null, existingUser);
          } else {
            // we do not have a user record with this google id - register a new record
            new User({
                googleID: profile.id
              })
              .save()
              .then(user => done(null, user));
          }
        })
    }
  )
);