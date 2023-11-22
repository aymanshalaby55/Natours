const express = require('express');
const reviewcotroller = require('../Controllers/reviweController');
const authController = require('../Controllers/authController');

const routs = express.Router({ mergeParams: true }); // allow access to reviwe parameters

routs
  .route('/')
  .get(reviewcotroller.getReviwes)
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewcotroller.setUserTourIds,
    reviewcotroller.CreateReviwe
  );

routs
  .route('/:id')
  .patch(reviewcotroller.updateReview)
  .delete(reviewcotroller.deleteReview);

module.exports = routs;
