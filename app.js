const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

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
  User.findById("6668e1744695794034c1dfe8")
    .then((user) => {
      if (user) {
        req.user = user;
      } else {
        req.user = null;
      }
      next();
    })
    .catch((err) => {
      console.log(err);
      next(err);
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(errorControllers.get404);

mongoose
  .connect(
    "mongodb+srv://milunchik:newpassword1234@firstcluster.lu1iyrt.mongodb.net/shop?retryWrites=true&w=majority&appName=FirstCluster"
  )
  .then((result) => {
    User.findOne().then(user=>{
      if(!user){
        const user = new User({
      name: 'Emily',
      email: 'emily@test.com',
      cart:{
        items: []
      }
    })
    user.save();
      }
    })
    
    app.listen(3000);
    console.log("http://localhost:3000");
  })
  .catch((err) => {
    console.log(err);
  });