const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");
const Product = require("../models/product");
const Order = require("../models/order");
const newError = require("./error-handling");

const stripe = require("stripe")(
  "sk_test_51PTwUyP1EcKcBg8o5Uyg4yhRy08h7TqU7KlLYyZ4cCiZGsdlBj0CSYQwz3nfFOokGZx3NaEUBQVBaZWAD1dZyZZT00HXVjS3tV"
);

const itemOnPage = 3;

const getProducts = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalProducts = numProducts;
      return Product.find()
        .skip((page - 1) * itemOnPage)
        .limit(itemOnPage);
    })
    .then((products) => {
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        currentPage: page,
        hasNextPage: itemOnPage * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / itemOnPage),
      });
    })
    .catch((err) => {
      newError(err, next);
    });
};

const getProduct = (req, res, next) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err) => newError(err, next));
};

const getIndex = (req, res, next) => {
  const page = +req.query.page || 1;
  let totalProducts;
  Product.find()
    .countDocuments()
    .then((numProducts) => {
      totalProducts = numProducts;
      return Product.find()
        .skip((page - 1) * itemOnPage)
        .limit(itemOnPage);
    })
    .then((products) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: itemOnPage * page < totalProducts,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / itemOnPage),
      });
    })
    .catch((err) => {
      newError(err, next);
    });
};

const getCart = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err) => newError(err, next));
};

const postCart = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product) => {
      return req.user.addToCart(product);
    })
    .then((result) => {
      console.log(result);
      res.redirect("/cart");
    });
};

const postCartDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  req.user
    .removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err) => newError(err, next));
};

const getCheckout = (req, res, next) => {
  let products;
  let total = 0;

  req.user
    .populate("cart.items.productId")
    .then((user) => {
      products = user.cart.items;
      products.forEach((p) => {
        total += p.quantity * p.productId.price;
      });

      const lineItems = products.map((p) => ({
        price_data: {
          currency: "usd",
          unit_amount: p.productId.price * 100,
          product_data: {
            name: p.productId.title,
          },
        },
        quantity: p.quantity,
      }));

      return stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url:
          req.protocol + "://" + req.get("host") + "/checkout/success",
        cancel_url: req.protocol + "://" + req.get("host") + "/checkout/cancel",
      });
    })
    .then((session) => {
      res.render("shop/checkout", {
        path: "/checkout",
        pageTitle: "Checkout",
        products: products,
        totalPay: total,
        sessionId: session.id,
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send("Failed to process checkout");
    });
};

const postOrder = (req, res, next) => {
  req.user
    .populate("cart.items.productId")
    .then((user) => {
      console.log(user.cart.items);
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          productData: { ...i.productId },
        };
      });
      const order = new Order({
        user: {
          email: req.user.email,
          userId: req.user,
        },
        products: products,
      });
      console.log("Ordered");
      return order.save();
    })
    .then(() => {
      return req.user.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err) => newError(err, next));
};

const getOrders = (req, res, next) => {
  const userId = req.user._id;
  Order.find({ "user.userId": userId })
    .then((orders) => {
      res.render("shop/orders", {
        path: "orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err) => newError(err, next));
};

const getInvoice = (req, res, next) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) {
        return next(new Error("No order found."));
      }
      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error("Unauthorized"));
      }
      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new PDFDocument();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      const writeStream = fs.createWriteStream(invoicePath);

      pdfDoc.pipe(writeStream);
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.end();
    })
    .catch((err) => next(err));
};

module.exports = {
  getCart,
  getIndex,
  getOrders,
  getProduct,
  getProducts,
  postCart,
  postCartDeleteProduct,
  postOrder,
  getInvoice,
  getCheckout,
};
