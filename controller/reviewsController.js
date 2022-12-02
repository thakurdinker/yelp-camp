const Campground = require("../models/campground");
const Review = require("../models/review");

const catchAsync = require("../utils/catchAsync");

module.exports.create = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { body, rating } = req.body.review;
  const campground = await Campground.findById(id);
  const review = new Review({ body: body, rating: rating });
  review.author = req.user._id;
  campground.reviews.push(review);
  await review.save();
  await campground.save();
  req.flash("success", "Review added successfully");
  res.redirect(`/campgrounds/${campground._id}`);
});

module.exports.delete = catchAsync(async (req, res) => {
  const { id, reviewId } = req.params;
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } }); // Remove the ref of review from campground
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", "Review deleted successfully");
  res.redirect(`/campgrounds/${id}`);
});
