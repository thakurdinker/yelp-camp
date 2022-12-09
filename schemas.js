const BaseJoi = require("joi");
const sanitizeHtml = require('sanitize-html');


const extension = (joi) => ({
  type: 'string',
  base: joi.string(),
  messages: {
      'string.escapeHTML': '{{#label}} must not include HTML!'
  },
  rules: {
      escapeHTML: {
          validate(value, helpers) {
              const clean = sanitizeHtml(value, {
                  allowedTags: [],
                  allowedAttributes: {},
              });
              if (clean !== value) return helpers.error('string.escapeHTML', { value })
              return clean;
          }
      }
  }
});

const Joi = BaseJoi.extend(extension)


const campgroundSchema = Joi.object({
  campground: Joi.object({
    title: Joi.string().required().escapeHTML(),
    price: Joi.number().required().min(0),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
  }).required(),
  deleteImages: Joi.array(),
});

const reviewSchema = Joi.object({
  review: Joi.object({
    body: Joi.string().required().escapeHTML(),
    rating: Joi.number().required().min(1).max(5),
  }).required(),
});

const userSchema = Joi.object({
  user: Joi.object({
    username: Joi.string().required().escapeHTML(),
    email: Joi.string().required().escapeHTML(),
    password: Joi.string().required().min(8).max(20).escapeHTML(),
  }).required(),
});

module.exports = {
  campgroundSchema,
  reviewSchema,
  userSchema,
};
