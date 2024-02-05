const Stripe = require('stripe');
const Booking = require('./../Models/bookingmodel');
const Tour = require('../Models/TourModel'); // handle node models
const CatchAsync = require('./../utils/CatchAsync');
const factory = require('./handlerFactory');

// stripe object
const stripe = new Stripe(
  'sk_test_51Of7M7DUHuuBmb7n93KXG5b39HNIaA1rkyk4xaijXDsNKSVJP3q34FVoLwl4rVJpd3g07V4SACqhwkaVci92bhVg00ZDufv2PD'
);

exports.getCheckOutSession = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findById(req.params.tourId);

  console.log(process.env.STRIP_SECRET_KEY);

  const session = await stripe.checkout.sessions.create({
    expand: ['line_items'],
    payment_method_types: ['card'],
    success_url: `${req.protocol}://${req.get('host')}/?tour=${
      req.params.tourId
    }&user=${req.user.id}&price=${tour.price}`,
    cancel_url: `${req.protocol}://${req.get('host')}/tours/${tour.slug}`,
    customer_email: req.user.email,
    client_reference_id: req.params.tourId,
    line_items: [
      {
        price_data: {
          currency: 'usd',
          unit_amount: tour.price * 100,
          product_data: {
            name: `${tour.name} Tour`,
            description: tour.summary
          }
        },
        quantity: 1
      }
    ],
    mode: 'payment'
  });

  res.status(200).json({
    status: 'success',
    session
  });
});

exports.createCheckoutSession = CatchAsync(async (req, res, next) => {
  const { tour, user, price } = req.query;
  console.log(tour, user, price);
  if (!tour && !user && !price) {
    return next();
  }

  await Booking.create({ tour, user, price });

  res.redirect(req.originalUrl.split('?')[0]);
});

exports.CreateBooking = factory.createOne(Booking);
exports.getALlBookings = factory.getAll(Booking);
exports.DeleteBooking = factory.deleteOne(Booking);
exports.updateBooking = factory.UpdateOne(Booking);
