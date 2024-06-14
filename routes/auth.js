const express = require("express");
const router = express.Router();
const controllers = require("../controllers/auth");

router.get("/login", controllers.getLogin);
router.post("/login", controllers.postLogin);
router.get("/signup", controllers.getSignUp);
router.post("/signup", controllers.postSignUp);
router.post("/logout", controllers.postLogout);

module.exports = router;
