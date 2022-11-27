const express = require("express");
const router = express.Router({ mergeParams: true });

const Campground = require("../models/campground");
const Review = require("../models/review");

const { reviewSchema } = require("../schemas");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.message, 400);
  } else {
    next();
  }
};

router.post(
  "/",
  validateReview,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { body, rating } = req.body.review;
    const campground = await Campground.findById(id);
    const review = new Review({ body: body, rating: rating });
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Review added successfully");
    res.redirect(`/campgrounds/${campground._id}`);
  })
);

router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove the ref of review from campground
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Review deleted successfully");
    res.redirect(`/campgrounds/${id}`);
  })
);

module.exports = router;
