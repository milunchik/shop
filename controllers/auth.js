const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const axios = require("axios");
const url = "https://sandbox.api.mailtrap.io/api/send/2960595";
const token = "66cead96c03efe5609adf94245f50a98";

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
      if (password === confirmPassword) {
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
      } else {
        req.flash("error", "Passwords do not match");
        return res.redirect("/signup");
      }
    })
    .catch((err) => console.log(err));
};

const getReset = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    errorMessage: message,
  });
};

const postReset = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return req.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No user was found");
          return res.redirect("/reset");
        }
        user.resetToken = token;
        user.resetTokenExpiration = Date.now() + 3600000;
        user.save();
      })
      .then((result) => {
        //підвтердження зміни пароля
      })
      .catch((err) => console.log(err));
  });
  const currEmail = req.body.currentEmail;
  const upEmail = req.body.email;
  const upPassword = req.body.password;
  const upConfirmPassword = req.body.confirmPassword;
  if (upPassword === upConfirmPassword) {
    User.findOne({ email: currEmail });
    return bcrypt
      .hash(upPassword, 12)
      .then((hashedPassword) => {
        const newUser = new User({
          email: upEmail,
          password: hashedPassword,
          cart: { items: [] },
        });

        return newUser.save();
      })
      .then((result) => {
        //sendEmail(email);
        res.redirect("/login");
      })
      .catch((err) => console.log(err));
  } else {
    req.flash("error", "Passwords do not match");
    return res.redirect("/");
  }
};

function sendEmail(email) {
  const data = {
    from: {
      email: "mailtrap@example.com",
      name: "Mailtrap Test",
    },
    to: [
      {
        email: email,
      },
    ],
    subject: "You are awesome!",
    text: "You successfully made your action",
    category: "Integration Test",
  };
  axios
    .post(url, data, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })
    .then((response) => {
      console.log(response.data);
    })
    .catch((error) => {
      console.error("Error sending email:", error);
    });
}

module.exports = {
  getLogin,
  postLogin,
  postLogout,
  postSignUp,
  getSignUp,
  getReset,
  postReset,
};
