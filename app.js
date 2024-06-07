const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const mongoConnect = require("./util/database").mongoConnect;

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const errorControllers = require("./controllers/error");

const app = express();

app.set("view engine", "ejs");
app.set("views", "views");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/admin", adminRoutes);
app.use('shop', shopRoutes);
app.use(errorControllers.get404);

mongoConnect(() => {
  app.listen(3000)
  console.log("http://localhost:3000")
});
