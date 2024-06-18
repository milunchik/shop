const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const axios = require("axios");
const url = "https://sandbox.api.mailtrap.io/api/send/2960595";
const token = "66cead96c03efe5609adf94245f50a98";
const { query, validationResult } = require("express-validator");

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
  const errors = validationResult(req);

  User.findOne({ email: email })
    .then((user) => {
      if (!errors.isEmpty()) {
        res.render("auth/login", {
          path: "/login",
          pageTitle: "Login",
          errorMessage: errors.array()[0].msg,
        });
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
    oldInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

const postSignUp = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors.array());
    return res.status(422).render("auth/sign-up", {
      path: "/signup",
      pageTitle: "Sign Up",
      errorMessage: errors.array()[0].msg,
      oldInput: {
        email: email,
        password: password,
        confirmPassword: req.body.confirmPassword,
      },
      validationErrors: errors.array(),
    });
  }
  bcrypt
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
      sendEmail(email, "You are registered successfully");
      res.redirect("/login");
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
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return req.redirect("/reset");
    }
    const resetToken = buffer.toString("hex");
    User.findOne({ email: email })
      .then((user) => {
        if (!user) {
          req.flash("error", "No user was found");
          return res.redirect("/reset");
        }
        user.resetToken = resetToken;
        user.resetTokenExpiration = Date.now() + 3600000;
        sendEmail(
          email,
          `Click a link 'http://localhost:3000/reset/${resetToken}' to set a new password`
        );
        req.flash("error", "Go to your email to reset the password");
        return user.save();
      })
      .catch((err) => console.log(err));
  });
};

const getNewPassword = (req, res, next) => {
  const token = req.params.token;
  User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } })
    .then((user) => {
      let message = req.flash("error");
      if (message.length > 0) {
        message = message[0];
      } else {
        message = null;
      }
      res.render("auth/new-password", {
        path: "/new-password",
        pageTitle: "Reset Password",
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => console.log(err));
};

const postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  User.findOne({
    resetToken: passwordToken,
    resetTokenExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword) => {
      resetUser.password = hashedPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokenExpiration = undefined;
      return resetUser.save();
    })
    .then((result) => {
      res.redirect("/login");
    })
    .catch((err) => console.log(err));
};

function sendEmail(email, text) {
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
    subject: "New action in your account",
    text: text,
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
  getNewPassword,
  postNewPassword,
};
