const express = require("express");
const router = express.Router();
const multer = require("multer");
const { storage } = require("../cloudinary");
const upload = multer({ storage });

const Campgrounds = require("../controller/campgroundController");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router
  .route("/")
  .get(Campgrounds.index)
  .post(
    isLoggedIn,
    upload.array("images"),
    validateCampground,
    Campgrounds.createCampground
  );

router.get("/new", isLoggedIn, Campgrounds.renderNewForm);

router
  .route("/:id")
  .get(Campgrounds.show)
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("images"),
    validateCampground,
    Campgrounds.update
  )
  .delete(isLoggedIn, isAuthor, Campgrounds.delete);

router.get("/:id/edit", isLoggedIn, isAuthor, Campgrounds.renderEditForm);

module.exports = router;
