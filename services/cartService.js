// services/cartService.js
const mongoose = require("mongoose");
const Cart = require("../models/Cart");
const Product = require("../models/Products");

const isValidObjectId = id => mongoose.Types.ObjectId.isValid(id);

const findCartByUserID = async (userID) => {
  if (!isValidObjectId(userID)) throw { status: 400, message: "Invalid user id" };
  return Cart.findOne({ userID }).where("status").equals("active").populate("items.product");
};

const createCart = async (userID) => {
  if (!isValidObjectId(userID)) throw { status: 400, message: "Invalid user id" };
  const cart = await Cart.create({ userID: userID, status: "active" });
  return cart;
};

const getCart = async ({ userID }) => {
  if (!isValidObjectId(userID)) throw { status: 400, message: "Invalid user id" };
  let activeCart = await findCartByUserID(userID);
  if (!activeCart) {
    activeCart = await createCart(userID);
  }
  return activeCart;
};
const getCompletedOrders = async ({ userID }) => {
  if (!isValidObjectId(userID)) throw { status: 400, message: "Invalid user id" };
  let comletedOrders = await Cart.find({userID}).where("status").equals("completed").populate("items.product");
  if(!getCompletedOrders) return null;
  return comletedOrders;
};

const getCartProduct = async ({ userID, productID }) => {
  if (!isValidObjectId(userID) || !isValidObjectId(productID)) return null;
  const cart = await Cart.findOne({ userID }).where('status').equals('active');
  if(!cart)  return null;
  // If items are populated, compare _id; if not, compare ObjectId
  return cart.items.find(i => {
    if (!i.product) return false;
    if (typeof i.product === 'object' && i.product._id) {
      return i.product._id.toString() === productID.toString();
    }
    return i.product.toString() === productID.toString();
  }) || null;
};

/**
 * Add product to user's active cart. If product exists, increase qty.
 * Returns populated cart.
 */
const addItemToCart = async ({ userID, productID, qty = 1 }) => {
  if (!isValidObjectId(userID) || !isValidObjectId(productID)) throw { status: 400, message: "Invalid id(s)" };
  if (qty <= 0) throw { status: 400, message: "Quantity must be >= 1" };

  const product = await Product.findById(productID);
  if (!product) throw { status: 404, message: "Product not found" };

  let cart = await Cart.findOne({ userID }).where("status").equals("active");
  if (!cart) cart = await createCart(userID);

  // find existing item
  const idx = cart.items.findIndex(i => i.product.toString() === productID.toString());
  if (idx >= 0) {
    cart.items[idx].qty += qty;
    // Optionally update priceAtAdded if you want snapshot only at first add: keep original
  } else {
    cart.items.push({
      product: product._id,
      qty,
      priceAtAdded: typeof product.newPrice === "number" ? product.newPrice : product.price
    });
  }

  await cart.save();
  return cart.populate("items.product");
};

const removeItemFromCart = async ({ userID, productID }) => {
  if (!isValidObjectId(userID) || !isValidObjectId(productID)) throw { status: 400, message: "Invalid id(s)" };
  const cart = await Cart.findOne({ userID }).where("status").equals("active");
  if (!cart) throw { status: 404, message: "Cart not found" };

  cart.items = cart.items.filter(i => i.product.toString() !== productID.toString());
  await cart.save();
  return cart.populate("items.product");
};

const updateItemQty = async ({ userID, productID, qty }) => {
  if (!isValidObjectId(userID) || !isValidObjectId(productID)) throw { status: 400, message: "Invalid id(s)" };
  if (qty < 0) throw { status: 400, message: "Quantity must be >= 0" };

  const cart = await Cart.findOne({ userID }).where("status").equals("active");
  if (!cart) throw { status: 404, message: "Cart not found" };

  const idx = cart.items.findIndex(i => i.product.toString() === productID.toString());
  if (idx === -1) throw { status: 404, message: "Product not in cart" };

  if (qty === 0) {
    cart.items.splice(idx, 1);
  } else {
    cart.items[idx].qty = qty;
  }

  await cart.save();
  return cart.populate("items.product");
};

const clearCart = async (userID) => {
  if (!isValidObjectId(userID)) throw { status: 400, message: "Invalid user id" };
  const cart = await Cart.findOne({ userID }).where("status").equals("active");
  if (!cart) return null;
  cart.items = [];
  await cart.save();
  return cart;
};

/**
 * Checkout: mark current cart pending (so it's not active) and create a new active cart.
 * In real app, here you would create an Order, reduce stocks, handle payment.
 */
const checkoutCart = async ({ userID }) => {
    if (!isValidObjectId(userID)) {
    throw { status: 400, message: "Invalid user id" };
  }

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1️⃣ active cart авах
    const cart = await Cart.findOne({
      userID,
      status: "active",
    })
      .populate("items.product")
      .session(session);

    if (!cart || cart.items.length === 0) {
      throw { status: 400, message: "Cart is empty" };
    }

    // 2️⃣ stock хүрэлцээ шалгах
    for (const item of cart.items) {
      if (item.product.stock < item.qty) {
        throw {
          status: 400,
          message: `Not enough stock for "${item.product.title}"`
        };
      }
    }

    // 3️⃣ stock багасгах
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product._id },
        {
          $inc: { stock: -item.qty },
          $set: { available: true }
        },
        { session }
      );
    }

    // 4️⃣ cart → completed
    cart.status = "completed";
    await cart.save({ session });

    // 5️⃣ шинэ active cart үүсгэх
    const [newCart] = await Cart.create(
      [{ userID, status: "active", items: [] }],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    return {
      success: true,
      previousCart: await cart.populate("items.product"),
      newCart
    };
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    throw err;
  }
};

module.exports = {
  findCartByUserID,
  createCart,
  getCart,
  addItemToCart,
  removeItemFromCart,
  updateItemQty,
  clearCart,
  checkoutCart,
  getCartProduct,
  getCompletedOrders
};
