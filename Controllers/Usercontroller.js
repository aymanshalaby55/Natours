const { default: mongoose } = require('mongoose');
const User = require('../Models/userModel');
const CatchAsync = require('./../ultis/CatchAsync');
const AppErorr = require('../ultis/appError');
const { findById, findByIdAndUpdate } = require('../Models/TourModel');

const filterObj = (obj, ...allowedFileds) => {
  const newobj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFileds.includes(el)) {
      newobj[el] = obj[el];
    }
  });
  return newobj;
};

exports.GetAllUsers = CatchAsync(async (req, res, next) => {
  const user = await User.find();

  res.status(200).json({
    status: 'success',
    resluts: user.length,
    data: {
      user
    }
  });
});

exports.UpdateMe = CatchAsync(async (req, res, next) => {
  // user must not update password here.
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppErorr('this rout not for changing password!', 404));
  }

  // update user document.
  // filter properties that we want to be change only(email and name).
  const filter = filterObj(req.body, 'name', 'email');
  const UpdateUser = await User.findByIdAndUpdate(req.user.id, filter, {
    new: true,
    runvalidators: true
  });

  res.status(200).json({
    status: 'success',
    user: UpdateUser
  });
});
