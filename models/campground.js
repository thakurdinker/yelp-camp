const mongoose = require("mongoose");
const Review = require("./review");
const { cloudinary } = require("../cloudinary");

const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
  title: String,
  images: [
    {
      url: String,
      filename: String,
    },
  ],
  price: Number,
  description: String,
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  location: String,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// https://res.cloudinary.com/demo/image/upload/c_scale,w_100/face_top.jpg

CampgroundSchema.virtual("thumbnail").get(function () {
  return this.images.map(function (img) {
    return img.url.replace("/upload", "/upload/c_scale,w_100");
  });
});

// {title: campground.title, coordinates: campground.geometry.coordinates, id: campground._id}

CampgroundSchema.statics.geoJSON = async function () {
  const campgrounds = await this.find({});
  const geoData = campgrounds.map(function (campground) {
    return {
      title: campground.title,
      coordinates: campground.geometry.coordinates,
      id: campground._id,
    };
  });
  return geoData;
};

CampgroundSchema.post("findOneAndDelete", async (deletedCampground) => {
  const response = await Review.deleteMany({
    _id: { $in: deletedCampground.reviews },
  });
  // Delete Images associated with campground
  deletedCampground.images.forEach(async function (image) {
    await cloudinary.uploader.destroy(image.filename);
  });
});

const Campground = mongoose.model("Campground", CampgroundSchema);

module.exports = Campground;
