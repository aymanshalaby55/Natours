const express = require('express');
const TourControllers = require('./../Controllers/tourcontrollers');

const ToursRouter = express.Router(); // middleware for routing aka Mounting
//ToursRouter.param('id', TourControllers.CheckID);

ToursRouter.route('/tour-status').get(TourControllers.getTourStatus);
ToursRouter.route('/monthly-plan/:year').get(TourControllers.GetMonthlyPlan);

ToursRouter.route('/top-5-cheap').get(
  TourControllers.aliastoptours,
  TourControllers.GETALLTours
);
ToursRouter.route('/')
  .get(TourControllers.GETALLTours)
  .post(TourControllers.CreateTour);

ToursRouter.route('/:id')
  .get(TourControllers.GetTour)
  .patch(TourControllers.UpdateTour)
  .delete(TourControllers.DeleteTour);

module.exports = ToursRouter;
