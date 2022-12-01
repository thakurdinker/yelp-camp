const express = require("express");
const router = express.Router();

const Campgrounds = require("../controller/campgroundController");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");

router.get("/", Campgrounds.index);

router.post("/", isLoggedIn, validateCampground, Campgrounds.createCampground);

router.get("/new", isLoggedIn, Campgrounds.renderNewForm);

router.get("/:id", Campgrounds.show);

router.get("/:id/edit", isLoggedIn, isAuthor, Campgrounds.renderEditForm);

router.put(
  "/:id",
  isLoggedIn,
  isAuthor,
  validateCampground,
  Campgrounds.update
);

router.delete("/:id", isLoggedIn, isAuthor, Campgrounds.delete);

module.exports = router;
