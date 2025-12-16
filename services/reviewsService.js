const mongoose = require("mongoose");
const Reviews = require('../models/Reviews');

const findReviewByProductAndUser = async(productID,userID) =>{
    return Reviews.findOne({ productID, userID });
}

const createReview = async ({ userID, productID, rating, comment }) => {
  if (
    !mongoose.Types.ObjectId.isValid(userID) ||
    !mongoose.Types.ObjectId.isValid(productID)
  ) {
    throw { status: 400, message: "Invalid userID or productID" };
  }

  const existing = await findReviewByProductAndUser(productID, userID);
  if (existing) {
    throw {
      status: 400,
      message: "You have already reviewed this product"
    };
  }

  const review = await Reviews.create({
    userID,
    productID,
    rating,
    comment: comment || ""
  });

  return review;
};

const getReviewByUser = async(userID) => {
    return Reviews.find({userID});
}

const getReviewPuplic = (review) => {
    if(!review) return null;

const user = review.userID && review.userID._id ? {
        id: review.userID._id,
        name: review.userID.name,
    } : null;
    return {
        id: review._id,
        user,
        productID: review.productID,
        rating: review.rating,
        comment: review.comment,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt
    };
};

const getReviewsByProduct = async(productID) => {
    const reviews = await Reviews.find({productID}).populate('userID');
    const publicReviews = reviews.map(getReviewPuplic);
    const avgRating = reviews.reduce((acc,review) => acc + review.rating, 0) / reviews.length;
    const count = reviews.length;
    return {avgRating: avgRating.toFixed(2), length: count, reviews: publicReviews};
}

module.exports = { findReviewByProductAndUser, createReview, getReviewByUser, getReviewsByProduct };