const express = require("express");
const router = express.Router();
const Campground = require("../models/campground");

const { campgroundSchema } = require("../schemas");

const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    throw new ExpressError(error.message, 400);
  } else {
    next();
  }
};

router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds, title: "All Campgrounds" });
  })
);

router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { campground } = req.body;
    const newCampground = new Campground(campground);
    await newCampground.save();
    req.flash("success", "Campground Successfully Created");
    res.redirect(`/campgrounds/${newCampground._id}`);
  })
);

router.get("/new", (req, res) => {
  res.render("campgrounds/new", { title: "New Campground" });
});

router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    if (!campground) {
      req.flash("error", "Cannot find Campground");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground, title: "Campground" });
  })
);

router.get(
  "/:id/edit",
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
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Campground Deleted Successfully");
    res.redirect("/campgrounds");
  })
);

module.exports = router;
