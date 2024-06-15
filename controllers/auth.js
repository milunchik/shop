const bcrypt = require("bcryptjs");
const User = require("../models/user");
const emailjs = require("emailjs-com");

const getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    errorMessage: message,
  });
};

const postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then((user) => {
      if (!user) {
        req.flash("error", "Invalid email or password");
        return res.redirect("/login");
      }
      bcrypt
        .compare(password, user.password)
        .then((isMatch) => {
          if (isMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              console.log("Error: " + err);
              res.redirect("/");
            });
          }
          req.flash("error", "Invalid email or password");
          res.redirect("/login");
        })
        .catch((err) => {
          console.log(err);
          res.redirect("/login");
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

const postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log("Error: " + err);
    res.redirect("/");
  });
};

const getSignUp = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/sign-up", {
    path: "/signup",
    pageTitle: "Sign Up",
    errorMessage: message,
  });
};

const postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;

  User.findOne({ email: email })
    .then((userDoc) => {
      if (userDoc) {
        req.flash("error", "Email exists already");
        return res.redirect("/signup");
      }
      return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
          const newUser = new User({
            email: email,
            password: hashedPassword,
            cart: { items: [] },
          });

          return newUser.save();
        })
        .then((result) => {
          sendEmail(email);
          res.redirect("/login");
        })
        .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
};

const sendEmail = (email) => {
  const data = {
    service_id: "service_5o5rk1q",
    template_id: "template_qm3gnfd",
    user_id: "PvWkvXd0b0tAm-nWo",
    template_params: {
      username: email,
    },
  };

  emailjs
    .send(data.service_id, data.template_id, data.template_params, data.user_id)
    .then((response) => {
      console.log("Your mail is sent!", response.status, response.text);
    })
    .catch((error) => {
      console.error(error);
    });
};

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  postSignUp,
  getSignUp,
};
