const express = require("express");
const router = express.Router();

const productsController = require("../controllers/productsController");
const protect = require("../middleware/auth");
const adminOnly = require("../middleware/admin");

// Public routes

router.get("/", productsController.listProducts);
router.post("/bulk", protect, adminOnly, productsController.bulkCreateProducts);
router.get("/:id", productsController.getProductById);
//router.get("/", productsController.getAllProducts);
// Admin-only routes
router.post("/create", protect, adminOnly, productsController.createProduct);
router.put("/:id", protect, adminOnly, productsController.updateProduct);
router.delete("/:id", protect, adminOnly, productsController.deleteProduct);

module.exports = router;


