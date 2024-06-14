const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);

const errorControllers = require("./controllers/error");
const User = require("./models/user");

const MongoDB_URL = 'mongodb+srv://milunchik:newpassword1234@firstcluster.lu1iyrt.mongodb.net/shop?retryWrites=true&w=majority&appName=FirstCluster';

const app = express();
const store = new MongoDBStore({
  uri: MongoDB_URL,
  collection: 'session'
})
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
    store: store
  })
);

app.use((req, res, next)=>{
  if(req.session.user){
    return next()
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      console.log(err);
    })
  })

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorControllers.get404);

mongoose
  .connect(
    MongoDB_URL
  )
  .then((result) => {
    User.findOne().then((user) => {
      if (!user) {
        const user = new User({
          name: "Emily",
          email: "emily@test.com",
          cart: {
            items: [],
          },
        });
        user.save();
      }
    });

    app.listen(3000);
    console.log("http://localhost:3000");
  })
  .catch((err) => {
    console.log(err);
  });
