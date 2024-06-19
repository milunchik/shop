const express = require("express");
const { body } = require("express-validator");
const User = require("../models/user");
const router = express.Router();
const controllers = require("../controllers/auth");

router.get("/login", controllers.getLogin);
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Enter a valid email").normalizeEmail(),
    body(
      "password",
      "Enter a password with only numbers and text and at lest 6 characters"
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
  ],
  controllers.postLogin
);
router.get("/signup", controllers.getSignUp);
router.post(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Enter a valid email")
      .custom((value, { req }) => {
        return User.findOne({ email: value }).then((userDoc) => {
          if (userDoc) {
            return Promise.reject("Email exists already");
          }
        });
      })
      .normalizeEmail(),
    body(
      "password",
      "Enter a password with only numbers and text and at lest 6 characters"
    )
      .isLength({ min: 6 })
      .isAlphanumeric()
      .trim(),
    body("confirmPassword")
      .trim()
      .custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error("Passwords have to match");
        }
        return true;
      }),
  ],
  controllers.postSignUp
);
router.get("/reset", controllers.getReset);
router.post("/reset", controllers.postReset);
router.get("/reset/:token", controllers.getNewPassword);
router.post("/new-password", controllers.postNewPassword);
router.post("/logout", controllers.postLogout);

module.exports = router;
