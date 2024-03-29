const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { cloudinary } = require("../cloudinary");

const { geocoding } = require("../utils/fetchGeoData");

module.exports.index = catchAsync(async (req, res, next) => {
  if (req.signedCookies.returnTo) {
    res.clearCookie("returnTo");
  }
  const campgrounds = await Campground.find({});
  const geoData = await Campground.geoJSON();
  res.render("campgrounds/index", {
    campgrounds,
    title: "All Campgrounds",
    geoData,
  });
});

module.exports.createCampground = catchAsync(async (req, res, next) => {
  const { campground } = req.body;
  const geometry = await geocoding(campground.location);
  if (geometry === -1) {
    req.flash("error", "Invalid Location");
    return res.redirect("/campgrounds/new");
  }
  const newCampground = new Campground(campground);
  newCampground.geometry = geometry;
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
