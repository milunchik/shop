const express = require('express')

const router = express.Router();
const controllers = require('../controllers/shop')

router.get('/', controllers.getIndex)

router.get('/products', controllers.getProducts)

router.get('/products/:productsId', controllers.getProduct)

router.get('/cart', controllers.getCart)

router.post('/cart', controllers.postCart)

router.post('/cart-delete-item', controllers.postCartDeleteProduct)

router.post('/create-order', controllers.postOrder)

router.get('/orders', controllers.getOrders)

module.exports = router;





