const express = require('express');
const TourControllers = require('./../Controllers/tourcontrollers');
const authController = require('./../Controllers/authController');
const reviewController = require('./../Controllers/reviweController');
const reviewRouter = require('./reviewRout');

const ToursRouter = express.Router(); // middleware for routing aka Mounting
//ToursRouter.param('id', TourControllers.CheckID);

ToursRouter.use('/:tourId/reviwes', reviewRouter);

ToursRouter.route('/tour-status').get(TourControllers.getTourStatus);
ToursRouter.route('/monthly-plan/:year').get(
  authController.protect,
  authController.restrictTo('admin', 'lead-guide', 'guide'),
  TourControllers.GetMonthlyPlan
);

ToursRouter.route('/top-5-cheap').get(
  TourControllers.aliastoptours,
  TourControllers.GETALLTours
);

ToursRouter.route('/tour-within/:distance/center/:latlng/unit/:unit').get(
  TourControllers.tourWithin
);
ToursRouter.route('/distances/:latlng/unit/:unit').get(
  TourControllers.getDistance
);

ToursRouter.route('/')
  .get(TourControllers.GETALLTours)
  .post(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    TourControllers.CreateTour
  );

ToursRouter.route('/:id')
  .get(TourControllers.GetTour)
  .patch(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    TourControllers.UpdateTour
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    TourControllers.DeleteTour
  );

ToursRouter.route('/:TourId/reviwes').post(
  authController.protect,
  authController.restrictTo('user'),
  reviewController.CreateReviwe
);

module.exports = ToursRouter;
