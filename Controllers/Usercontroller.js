const { default: mongoose } = require('mongoose');
const User = require('../Models/userModel');
const CatchAsync = require('./../ultis/CatchAsync');
const AppErorr = require('../ultis/appError');
const {
  findById,
  findByIdAndUpdate,
  findByIdAndDelete
} = require('../Models/TourModel');
const factory = require('./handlerFactory');

const filterObj = (obj, ...allowedFileds) => {
  const newobj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFileds.includes(el)) {
      newobj[el] = obj[el];
    }
  });
  return newobj;
};

exports.GetAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);
// don't update password with this. this rout for admins.
exports.UpdateUser = factory.UpdateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

exports.UpdateMe = CatchAsync(async (req, res, next) => {
  // user must not update password here.
  if (req.body.password || req.body.confirmPassword) {
    return next(new AppErorr('this rout is not for updating password!', 404));
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

exports.deleteUser = CatchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    user: null
  });
});
