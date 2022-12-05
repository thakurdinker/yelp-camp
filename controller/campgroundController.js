const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { cloudinary } = require("../cloudinary");

module.exports.index = catchAsync(async (req, res, next) => {
  if (req.signedCookies.returnTo) {
    res.clearCookie("returnTo");
  }
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index", { campgrounds, title: "All Campgrounds" });
});

module.exports.createCampground = catchAsync(async (req, res, next) => {
  const { campground } = req.body;
  const newCampground = new Campground(campground);
  newCampground.author = req.user._id;
  newCampground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  await newCampground.save();
  req.flash("success", "Campground Successfully Created");
  res.redirect(`/campgrounds/${newCampground._id}`);
});

module.exports.renderNewForm = (req, res) => {
  req.session.returnTo = req.originalUrl;
  res.render("campgrounds/new", { title: "New Campground" });
};

module.exports.show = catchAsync(async (req, res, next) => {
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
});

module.exports.renderEditForm = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground) {
    req.flash("error", "Cannot find Campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { campground, title: "Edit Campground" });
});

module.exports.update = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { campground, deleteImages } = req.body;
  const updatedCampground = await Campground.findByIdAndUpdate(id, campground, {
    runValidators: true,
    returnDocument: "after",
  });
  const newImages = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  updatedCampground.images.push(...newImages);
  await updatedCampground.save();
  if (deleteImages) {
    for (let filename of deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await updatedCampground.updateOne({
      $pull: { images: { filename: { $in: deleteImages } } },
    });
  }
  req.flash("success", "Campground Updated Successfully");
  res.redirect(`/campgrounds/${updatedCampground._id}`);
});

module.exports.delete = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Campground Deleted Successfully");
  res.redirect("/campgrounds");
});
