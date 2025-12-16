const asyncHandler = require("../utils/asyncHandler");
const reviewsService = require("../services/reviewsService");

    // Create a new review
const createReview = asyncHandler(async (req, res) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Not authorized"
    });
  }

  const userID = req.user.id;
  const { productID, rating, comment } = req.body;

  if (!productID || !rating) {
    return res.status(400).json({
      success: false,
      message: "productID and rating are required"
    });
  }

  const review = await reviewsService.createReview({
    userID,
    productID,
    rating,
    comment
  });

  res.status(201).json({
    success: true,
    data: review
  });
});


const getReviewByUser = asyncHandler(async (req,res)=>{
    const { userID } = req.query;
    const review = await reviewsService.getReviewByUser(userID);
    res.json(review);
});
const getReviewsByProduct = asyncHandler(async (req,res)=>{
    const { productID } = req.query;
    const reviews = await reviewsService.getReviewsByProduct(productID);
    res.json(reviews);
});
const getReviewByProductAndUser = asyncHandler(async (req,res)=>{
    const { productID, userID } = req.query;
    const review = await reviewsService.findReviewByProductAndUser(productID,userID);
    res.json(review);
});
module.exports = { createReview, getReviewByUser, getReviewsByProduct, getReviewByProductAndUser };