const express = require("express");
const router = express.Router();
const protect = require("../middleware/auth");
const cartController = require("../controllers/cartController");

router.get("/", protect, cartController.getCart);
router.get("/completed-orders", protect, cartController.getCompletedOrders);
router.get("/product", protect, cartController.getCartProduct);
router.post("/items", protect, cartController.addItem);
router.put("/items", protect, cartController.updateItem);
router.delete("/items/:productId", protect, cartController.removeItem);
router.post("/checkout", protect, cartController.checkout);

module.exports = router;
