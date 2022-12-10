if (process.env.NODE_ENV != "production") {
  require("dotenv").config({ path: "./vars/.env" });
}

console.log(process.env.NODE_ENV);

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
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const MongoDBStore = require("connect-mongo");

const campgroundRouter = require("./routes/campgrounds");
const reviewsRouter = require("./routes/reviews");
const userRouter = require("./routes/users");
const ExpressError = require("./utils/ExpressError");

const User = require("./models/user");
const multer = require("multer");

const secret = process.env.SECRET || "thisisnotagreatsecret";
const dbURL = process.env.MONGODB_URL || "mongodb://127.0.0.1:27017/yelp-camp";
const port = process.env.PORT || 3000;

const store = MongoDBStore.create({
  mongoUrl: dbURL,
  touchAfter: 24 * 3600,
  crypto: {
    secret: secret,
  },
});

store.on("error", function (e) {
  console.log("SESSION STORE ERROR");
});

const sessionConfig = {
  store,
  name: "session",
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    // secure: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};

const scriptSrcUrls = [
  "https://unpkg.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
  "https://unpkg.com/",
  "https://kit-free.fontawesome.com/",
  "https://stackpath.bootstrapcdn.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [];
const fontSrcUrls = [];

const imgSrcUrls = [
  "https://unpkg.com/leaflet@1.3.1/dist/images/",
  "https://unpkg.com/leaflet@1.3.1/dist/images/",
  "https://unpkg.com/leaflet@1.9.3/dist/images/",
  "https://res.cloudinary.com/dlbytbeiw/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
  "https://images.unsplash.com/",
  "https://b.tile.osm.org/",
  "https://c.tile.osm.org/",
  "https://a.tile.osm.org/",
  "https://tile.openstreetmap.org/",
];

// process.env.MONGODB_URL
// "mongodb://127.0.0.1:27017/yelp-camp"

mongoose.connect(dbURL, {
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
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: [],
        connectSrc: ["'self'", ...connectSrcUrls],
        scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
        styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
        workerSrc: ["'self'", "blob:"],
        objectSrc: [],
        imgSrc: ["'self'", "blob:", "data:", ...imgSrcUrls],
        fontSrc: ["'self'", ...fontSrcUrls],
      },
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Resource-Policy", "same-site");
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currentUser = req.user;
  next();
});
app.use(mongoSanitize());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", (req, res) => {
  res.render("home");
});

app.use("/", userRouter);
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds/:id/reviews", reviewsRouter);

app.all("*", (req, res) => {
  throw new ExpressError("Page not Found", 404);
});

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    req.flash("error", `${err.message}. Max 3 files are allowed`);
    const redirectUrl = req.session.returnTo || "/campgrounds";
    delete req.session["returnTo"];
    return res.redirect(redirectUrl);
  }
  const { statusCode = 500 } = err;
  if (!err.message) err.message = "Something went wrong";
  res.status(statusCode).render("error", { err, title: "Error" });
});

app.listen(port, () => {
  console.log(`Server started on port: ${port} `);
});
