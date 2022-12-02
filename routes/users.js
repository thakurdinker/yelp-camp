const express = require("express");
const router = express.Router();

const { validateNewUser } = require("../middleware");
const User = require("../controller/usersController");

const passport = require("passport");

router
  .route("/register")
  .get(User.registerForm)
  .post(validateNewUser, User.register);

router
  .route("/login")
  .get(User.loginForm)
  .post(
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    User.login
  );

router.get("/logout", User.logout);

module.exports = router;
