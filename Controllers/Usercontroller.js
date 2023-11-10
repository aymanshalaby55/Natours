const { default: mongoose } = require('mongoose');
const User = require('../Models/userModel');
const CatchAsync = require('./../ultis/CatchAsync');

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
