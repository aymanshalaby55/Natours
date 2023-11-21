const CatchAsync = require('../ultis/CatchAsync');
const Review = require('./../Models/reviweModel');

exports.getReviwes = CatchAsync(async (req, res, next) => {
  let filter = {};
  if (req.params.tourId) {
    filter = { tour: req.params.tourId };
  }

  const reviews = await Review.find(filter);

  res.status(200).json({
    status: 'sucess',
    data: reviews
  });
});

exports.CreateReviwe = CatchAsync(async (req, res, next) => {
  // nested rout
  if (!req.body.tour) req.body.tour = req.params.tour;
  req.body.user = req.user.user; // enforce loged in user

  const review = await Review.create(req.body);

  res.status(201).json({
    status: 'sucess',
    review
  });
});
