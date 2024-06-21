const express = require("express");
const router = express.Router();
const controllers = require("../controllers/shop");
const authControllers = require("../middleware/authMiddleware");

router.get("/", controllers.getIndex);

router.get("/products", controllers.getProducts);

router.get("/products/:productId", controllers.getProduct);

router.get("/cart", authControllers, controllers.getCart);

router.post("/cart", authControllers, controllers.postCart);

router.post(
  "/cart-delete-item",
  authControllers,
  controllers.postCartDeleteProduct
);

router.get("/checkout", authControllers, controllers.getCheckout);

router.get("/checkout/success", controllers.postOrder);

router.get("/checkout/cancel", controllers.getCheckout);

// router.post("/create-order", authControllers, controllers.postOrder);

router.get("/orders", authControllers, controllers.getOrders);

router.get("/orders/:orderId", authControllers, controllers.getInvoice);

module.exports = router;
