const Booking = require('../Models/bookingmodel');
const CatchAsync = require('../utils/CatchAsync');
const AppErorr = require('../utils/appError');
const Tour = require('./../Models/TourModel');
const User = require('./../Models/userModel');

exports.getOverview = CatchAsync(async (req, res) => {
  const tours = await Tour.find();
  res.status(200).render('overview', {
    title: 'All Tours',
    tours: tours
  });
});

exports.getTour = CatchAsync(async (req, res, next) => {
  const tour = await Tour.findOne({ slug: req.params.slug }).populate({
    path: 'reviews',
    select: 'review rating'
  });

  // console.log(data);
  if (!tour) {
    return next(new AppErorr('No tour with that name!', 404));
  }

  res.status(200).render('tour', {
    title: `${tour.name}`,
    tour: tour
  });
});

exports.loginForm = CatchAsync(async (req, res) => {
  res
    .status(200)
    .set('Content-Security-Policy', "connect-src 'self' http://127.0.0.1:3000")
    .render('login', {
      title: 'Login'
    });
});

exports.getAccountPage = (req, res) => {
  res.status(200).render('account', {
    title: 'Your Account'
  });
};

exports.getMyTours = CatchAsync(async (req, res, next) => {
  //1? get all bookings
  console.log('hello');
  const bookings = await Booking.find({ user: req.user.id });

  const tourIDs = bookings.map(el => el.tour.id);
  const tours = await Tour.find({ _id: { $in: tourIDs } });

  console.log(tours);

  res.render('overview', {
    title: 'My Tours',
    tours
  });
});
exports.updateUserData = CatchAsync(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email
    },
    {
      new: true,
      runValidators: true
    }
  );

  //console.log(updateUser);

  res.status(200).render('account', {
    title: 'Your Account',
    user: updatedUser
  });
});
