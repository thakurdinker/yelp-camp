const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const mongoose = require("mongoose");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const cookierParser = require("cookie-parser");
const LocalStrategy = require("passport-local");

const campgroundRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/users");
const ExpressError = require("./utils/ExpressError");

const User = require("./models/user");

const sessionConfig = {
  secret: "thisisnotagreatsecret",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

mongoose.connect("mongodb://127.0.0.1:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error: "));
db.once("open", () => {
  console.log("Database connected");
});

app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookierParser("Thisisasignedcookie"));
app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// app.get("/", (req, res) => {
//   res.render("home");
// });

app.get("/fakeUser", async (req, res) => {
  const user = new User({
    email: "dinker.thakur55@gmail.com",
    username: "dinker",
  });
  const registeredUser = await User.register(user, "Notagreatpassword");
  res.send(registeredUser);
});

app.use("/", userRouter);
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds/:id/reviews", reviewsRouter);

app.all("*", (req, res) => {
  throw new ExpressError("Page not Found", 404);
});

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err, title: "Error" });
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
