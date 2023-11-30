const CatchAsync = require('../ultis/CatchAsync');
const Review = require('./../Models/reviweModel');
const factory = require('./handlerFactory');

exports.setUserTourIds = (req, res, next) => {
  // nested rout
  if (!req.body.tour) req.body.tour = req.params.tour;
  req.body.user = req.user.user; // enforce loged in user
  next();
};

exports.getReviwes = factory.getAll(Review);

exports.getReview = factory.getOne(Review);

exports.CreateReviwe = factory.createOne(Review);

exports.updateReview = factory.UpdateOne(Review);

exports.deleteReview = factory.deleteOne(Review);
