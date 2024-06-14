const User = require("../models/user");

const getLogin = (req, res, next) => {
  console.log(req.session.isLoggedIn);
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
  });
};

const postLogin = (req, res, next) => {
  User.findById("6668e1744695794034c1dfe8")
    .then((user) => {
      req.session.isLoggedIn = true;
      req.session.user = user;
      req.session.save(()=>{
       console.log(err)
       res.redirect("/"); 
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

const postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
};
