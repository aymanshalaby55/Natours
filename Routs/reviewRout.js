const express = require('express');
const reviewcotroller = require('../Controllers/reviweController');
const authController = require('../Controllers/authController');

const routs = express.Router({ mergeParams: true }); // allow access to reviwe parameters

routs.use(authController.protect);

routs
  .route('/')
  .get(reviewcotroller.getReviwes)
  .post(
    authController.restrictTo('user'),
    reviewcotroller.setUserTourIds,
    reviewcotroller.CreateReviwe
  );

routs
  .route('/:id')
  .get(reviewcotroller.getReview)
  .patch(
    authController.restrictTo('user', 'admin'),
    reviewcotroller.updateReview
  )
  .delete(
    authController.restrictTo('user', 'admin'),
    reviewcotroller.deleteReview
  );

module.exports = routs;
