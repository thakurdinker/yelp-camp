const Joi = require("joi");
const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required(),
    price: Joi.number().required().min(0),
    location: Joi.string().required(),
    description: Joi.string().required(),
  }).required(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});

const userSchema = Joi.object({
  user: Joi.object({
    username: Joi.string().required(),
    email: Joi.string().required(),
    password: Joi.string().required().min(8).max(20),
  }).required(),
});

module.exports = {
  campgroundSchema,
  reviewSchema,
  userSchema,
};
