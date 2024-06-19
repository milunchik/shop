const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");

const errorControllers = require("./controllers/error");
const User = require("./models/user");

const MongoDB_URL =
  "mongodb+srv://milunchik:newpassword1234@firstcluster.lu1iyrt.mongodb.net/shop?retryWrites=true&w=majority&appName=FirstCluster";

const app = express();
const store = new MongoDBStore({
  uri: MongoDB_URL,
  collection: "session",
});
const csrfProtection = csrf();

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "my secret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (!user) {
        next();
      }
      req.user = user;
      next();
    })
    .catch((err) => {
      next(new Error(err));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

app.get("/500", errorControllers.get500);

app.use(errorControllers.get404);

app.use((error, req, res, next) => {
  res.redirect("/500");
});

mongoose
  .connect(MongoDB_URL)
  .then((result) => {
    app.listen(3000);
    console.log("http://localhost:3000");
  })
  .catch((err) => {
    console.log(err);
  });
