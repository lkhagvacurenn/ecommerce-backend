// controllers/cartController.js
const asyncHandler = require("../utils/asyncHandler");
const cartService = require("../services/cartService");

// GET /api/cart (protected)
const getCart = asyncHandler(async (req, res) => {
  const cart = await cartService.getCart({ userID: req.user.id });
  res.json(cart);
});

const getCartProduct = asyncHandler(async (req, res) => {
  const userID = req.user?.id;
  const {productID} = req.query;

  if (!userID) return res.status(401).json({ success: false, message: "Not authorized" });
  if (!productID) return res.status(400).json({ success: false, message: "productId is required" });

  const result = await cartService.getCartProduct({ userID, productID });
  if (!result) {
    // either no cart or product not present; still return cart (maybe newly created) and null item
    return res.json({ success: true, data: result, isLiked: false});
  }
  // result = { cart, item }
  return res.json({ success: true, data: result, isLiked: true });
})

// POST /api/cart/items  body: { productID, qty }
const addItem = asyncHandler(async (req, res) => {
  const { productID, qty } = req.body;
  const cart = await cartService.addItemToCart({ userID: req.user.id, productID, qty });
  res.status(200).json(cart);
});

// PUT /api/cart/items  body: { productID, qty }
const updateItem = asyncHandler(async (req, res) => {
  const { productID, qty } = req.body;
  const cart = await cartService.updateItemQty({ userID: req.user.id, productID, qty });
  res.json(cart);
});

// DELETE /api/cart/items/:productId
const removeItem = asyncHandler(async (req, res) => {
  const productID = req.params.productId;
  const cart = await cartService.removeItemFromCart({ userID: req.user.id, productID });
  res.json(cart);
});

// POST /api/cart/checkout
const checkout = asyncHandler(async (req, res) => {
  const result = await cartService.checkoutCart({ userID: req.user.id });
  res.json(result);
});

const getCompletedOrders = asyncHandler(async (req, res) => {
  const result = await cartService.getCompletedOrders({ userID: req.user.id });
  res.json(result);
});

module.exports = { getCart, addItem, updateItem, removeItem, checkout,getCartProduct,getCompletedOrders };
