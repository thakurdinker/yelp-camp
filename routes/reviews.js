const express = require("express");
const router = express.Router({ mergeParams: true });

const Review = require("../controller/reviewsController");

const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware");

router.post("/", isLoggedIn, validateReview, Review.create);

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, Review.delete);

module.exports = router;
