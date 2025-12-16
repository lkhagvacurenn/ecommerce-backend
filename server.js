// server.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();
app.use(express.json());
app.use(cors());

connectDB();

// routes
const authRoutes = require("./routes/auth");
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const reviewsRoutes = require("./routes/reviews");
const cartRoutes = require('./routes/cart');
app.use("/api/auth", authRoutes);
app.use("/api/categories", categoriesRoutes);
app.use("/api/products", productsRoutes);
app.use("/api/reviews", reviewsRoutes);
app.use('/api/cart', cartRoutes);

/*  admin example route file mounting
    const adminRoutes = require("./routes/admin"); // create later
    app.use("/api/admin", adminRoutes); */

// simple protected test route
const protect = require("./middleware/auth");
app.get("/api/protected", protect, (req, res) => res.json({ message: `Hello ${req.user.email}` }));

// global error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || "Server Error" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
