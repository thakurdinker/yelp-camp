const Campground = require("./models/campground");
const Review = require("./models/review");
const catchAsync = require("./utils/catchAsync");
const { campgroundSchema, reviewSchema } = require("./schemas");
const ExpressError = require("./utils/ExpressError");

const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    // Clear previously sent cookie
    res.cookie("returnTo", req.originalUrl, { signed: true, httpOnly: true });
    req.flash("error", "You must be logged in");
    return res.redirect("/login");
  }

  next();
};

const isAuthor = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Campground not found");
    return res.redirect("/campgrounds");
  }

  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You don't have the permission");
    return res.redirect(`/campgrounds/${campground._id}`);
  }

  next();
});

const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId).populate("author");
  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/campgrounds/${id}`);
  }
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You don't have the permission");
    return res.redirect(`/campgrounds/${id}`);
  }

  next();
};

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.message, 400);
  } else {
    next();
  }
};

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.message, 400);
  } else {
    next();
  }
};

module.exports = { isLoggedIn, isAuthor, validateCampground, validateReview, isReviewAuthor };
