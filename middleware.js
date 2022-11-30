const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Clear previously sent cookie
    res.cookie("returnTo", req.originalUrl, { signed: true, httpOnly: true });
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  next();
};

module.exports = isLoggedIn;
