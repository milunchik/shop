const express = require("express");
const router = express.Router();
const controllers = require("../controllers/admin");
const authControllers = require('../middleware/authMiddleware')

router.get('/add-product', authControllers, controllers.getAddProduct);

router.get('/products', authControllers, controllers.getProducts);

router.post('/add-product', authControllers, controllers.postAddProduct);

router.get('/edit-product/:productId', authControllers, controllers.getEditProduct);

router.post('/edit-product', authControllers, controllers.postEditProduct);

router.post('/delete-product', authControllers, controllers.postDeleteProduct);

module.exports = router;
