const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { userSchema } = require("../schemas");
const ExpressError = require("../utils/ExpressError");
const passport = require("passport");

const validateNewUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.message, 400);
  } else {
    next();
  }
};

router.get("/register", (req, res) => {
  res.render("users/register", { title: "Register" });
});

router.post("/register", validateNewUser, async (req, res) => {
  try {
    const { username, email, password } = req.body.user;
    const user = new User({ username: username, email: email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash(
        "success",
        `Hi ${registeredUser.username}, Welcome to Campgrounds`
      );
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
});

router.get("/login", (req, res) => {
  res.render("users/login", { title: "Login" });
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  (req, res) => {
    let redirectUrl = req.signedCookies.returnTo || "/campgrounds";
    // If user is not logged in and submits a review we redirect the login and then back to campground show page
    if (redirectUrl.includes("reviews"))
      redirectUrl = redirectUrl.slice(0, redirectUrl.lastIndexOf("/"));
    // Remove the cookie for redirectUrl
    res.clearCookie("returnTo");
    req.flash("success", "Welcome Back");
    res.redirect(redirectUrl);
  }
);

router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (!err) {
      req.flash("success", "Goodbye!");
      res.redirect("/campgrounds");
    } else {
      throw new ExpressError("Logout Error", 500);
    }
  });
});

module.exports = router;
