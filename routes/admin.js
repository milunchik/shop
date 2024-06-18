const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const controllers = require("../controllers/admin");
const authControllers = require("../middleware/authMiddleware");

router.get("/add-product", authControllers, controllers.getAddProduct);

router.get("/products", authControllers, controllers.getProducts);

router.post(
  "/add-product",
  [
    body("title").isString().isLength({ min: 3, max: 100 }).trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 8, max: 500 }).trim(),
  ],
  authControllers,
  controllers.postAddProduct
);

router.get(
  "/edit-product/:productId",
  authControllers,
  controllers.getEditProduct
);

router.post(
  "/edit-product",
  [
    body("title").isString().isLength({ min: 3 }).trim(),
    body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 8, max: 500 }).trim(),
  ],
  authControllers,
  controllers.postEditProduct
);

router.post("/delete-product", authControllers, controllers.postDeleteProduct);

module.exports = router;
