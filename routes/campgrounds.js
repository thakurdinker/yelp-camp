const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");

const catchAsync = require("../utils/catchAsync");

const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds, title: "All Campgrounds" });
  })
);

router.post(
  "/",
  isLoggedIn,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { campground } = req.body;
    const newCampground = new Campground(campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash("success", "Campground Successfully Created");
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new", { title: "New Campground" });
});

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    if (!campground) {
      req.flash("error", "Cannot find Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground, title: "Campground" });
  })
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Cannot find Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground, title: "Edit Campground" });
  })
);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const { campground } = req.body;
    const updatedCampground = await Campground.findByIdAndUpdate(
      id,
      campground,
      { runValidators: true, returnDocument: "after" }
    );
    req.flash("success", "Campground Updated Successfully");
    res.redirect(`/campgrounds/${updatedCampground._id}`);
  })
);

router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground Deleted Successfully");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
