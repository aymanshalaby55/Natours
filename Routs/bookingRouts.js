const express = require('express');
const bookingCotroller = require('../Controllers/bookingController');
const authController = require('../Controllers/authController');

const router = express.Router(); // allow access to reviwe parameters

router.use(authController.protect);

router.get('/checkout-session/:tourId', bookingCotroller.getCheckOutSession);

router.use(authController.restrictTo('admin', 'lead-guide'));

router
  .route('/')
  .get(bookingCotroller.getALlBookings)
  .post(bookingCotroller.CreateBooking);

router
  .route('/:id')
  .delete(bookingCotroller.getALlBookings)
  .patch(bookingCotroller.DeleteBooking);

module.exports = router;
