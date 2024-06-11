const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoConnect = require("./util/database").mongoConnect;

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorControllers = require("./controllers/error");
const User = require('./models/user')

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  User.findById('66608acd7db4ae0bc46258a7')
    .then(user => {
      if (user) {
        req.user = new User(user.name, user.email, user.cart, user._id);
      } else {
        req.user = null;
      }
      next();
    })
    .catch(err => {
      console.log(err);
      next(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorControllers.get404);

mongoConnect(() => {
  app.listen(3000)
  console.log("http://localhost:3000")
});
