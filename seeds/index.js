const mongoose = require("mongoose");
const Campground = require("../models/campground");
const cities = require("./cities.js");
const { descriptors, places } = require("./seedHelpers");

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database Connected");
});

const sample = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new Campground({
      author: "6388bb72bd9986d876081c61",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      images: [
        {
          url: "https://res.cloudinary.com/dlbytbeiw/image/upload/v1670079578/YelpCamp/duipymv4jjzuz3icqotm.jpg",
          filename: "YelpCamp/duipymv4jjzuz3icqotm",
        },
        {
          url: "https://res.cloudinary.com/dlbytbeiw/image/upload/v1670079585/YelpCamp/wqw4zfj3at7lufruokwa.jpg",
          filename: "YelpCamp/wqw4zfj3at7lufruokwa",
        },
      ],
      price: price,
      description:
        "Lorem ipsum dolor, sit amet consectetur adipisicing elit. Corrupti iusto veritatis, sunt quod dicta quidem quia modi enim nulla esse fugiat consectetur aliquam atque expedita porro culpa. Ad, quae placeat?",
    });

    await camp.save();
  }
};

seedDB().then(() => mongoose.connection.close());
