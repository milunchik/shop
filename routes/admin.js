const express = require("express");
const router = express.Router();
const controllers = require("../controllers/admin");

router.get('/add-product', controllers.getAddProduct);

router.get('/products', controllers.getProducts);

router.post('/add-product', controllers.postAddProduct);

router.get('/edit-product/:productId', controllers.getEditProduct);

router.post('/edit-product', controllers.postEditProduct);

router.post('/delete-product', controllers.postDeleteProduct);

module.exports = router;
