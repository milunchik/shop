const mongodb = require("mongodb");
const Product = require("../models/product");

const getAddProduct = (req, res, next) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editting: false,
  });
};

const postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const price = req.body.price;
  const description = req.body.description;
  const imageUrl = req.body.imageUrl;
  const product = new Product(title, price, description, imageUrl);

  product
    .save()
    .then((result) => {
      console.log(result);
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

const getEditProduct = (req, res, next) => {
  const editMode = req.quire.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const id = req.params.productId;
  Product.findById(id)
    .then((product) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => console.log(err));
};

const postEditProduct = (req, res, next) => {
  const prId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedDesc = req.body.description;
  const updatedImageUrl = req.body.imageUrl;

  const product = new Product(
    updatedTitle,
    updatedPrice,
    updatedDesc,
    updatedImageUrl,
    prId
  );

  product
    .save()
    .then((result) => {
      console.log(prodId);
      console.log(req.user._id);
      console.log("Updated");
      res.redirect("/admin/products");
    })
    .catch((err) => console.log(err));
};

const getProducts = (req, res, next)=>{
    Product.fetchAll()
    .then(products=>{
        res.render('/admin/products',{
            prods: products,
           pageTitle: 'Admin Products',
           path: '/admin/products'
        })
        
    })
    .catch(err=>console.log(err))
}

const postDeleteProduct = (req, res, next)=>{
    const prodId = req.body.productId
    Product.deleteById(prodId)
    .then(()=>{
        console.log('Deleted')
        res.redirect('/admin/products')
    })
    .catch(err=>console.log(err))
};


module.exports = {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  getProducts,
  postDeleteProduct
};
