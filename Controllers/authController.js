const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { promisify } = require('util');
const CatchAsync = require('../ultis/CatchAsync');
const User = require('./../Models/userModel');
const AppErorr = require('./../ultis/appError');
const sendEmail = require('./../ultis/email');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_secret, {
    expiresIn: process.env.JWT_Expire
  });
};

const CreateSendToken = (user, code, res) => {
  const token = signToken(user._id);
  res.status(code).json({
    status: 'succss',
    token
  });
};
exports.signup = CatchAsync(async (req, res, next) => {
  // allow only the data we want to be storeD.
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordconfirm: req.body.passwordConfirm,
    role: req.body.role
  });

  // define token for user.
  CreateSendToken(newUser, 201, res);
});

exports.login = CatchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check for email and password
  if (!email || !password) {
    return next(new AppErorr('please enter email and password'), 400);
  }

  // check if email and password are correct
  const user = await User.findOne({ email }).select('+password');

  // check for encrpted password in user model
  const correct = await user.correctPassword(password, user.password);

  if (!user || !correct) {
    return next(new AppErorr('incorrect Email or password', 401));
  }

  // response with token
  CreateSendToken(user, 200, res);
});

exports.protect = CatchAsync(async (req, res, next) => {
  // get the JWT
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(
      new AppErorr('you are not logged in please log in to get access', 401)
    );
  }
  // verify the JWT
  const verify = await promisify(jwt.verify)(
    token,
    process.env.JWT_secret,
    () => {}
  );

  //check for user exist
  const freshUser = await User.findById(verify.id);
  if (!freshUser) {
    return next(new AppErorr('User of this token has been delete', 401));
  }

  // check if user change password after JWT
  if (freshUser.PasswordChangedAfter(verify.iat)) {
    return next(
      new AppErorr(
        'User recently changed his password! please log in again',
        401
      )
    );
  }

  req.user = freshUser; // will be used in retrictto
  next();
});

// Proctecting routs from unauthorized users
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      next(
        new AppErorr('You do not have the permission to do this action', 403)
      );
    }
    next();
  };
};

exports.forgetPassword = CatchAsync(async (req, res, next) => {
  // 1) get user via email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppErorr('No User exist with that email', 404));
  }

  //2)create random token for user
  const resetToken = await user.resetPasswordToken();
  await user.save({ validatorBeforeSave: false }); // save update values without using the validators

  //3)Send it to user's email.
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Your password reset token (valid for 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token sent to email!'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppErorr(
        'There was an error sending the email. Try again later!',
        500
      )
    );
  }
});

exports.resetPassword = CatchAsync(async (req, res, next) => {
  // get user based on thier reset token.
  const encrptedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  //console.log(encrptedToken);
  const user = await User.findOne({
    passwordResetToken: encrptedToken,
    expireResetToken: { $gt: Date.now() }
  });

  // check if user exist and token not expired then update user password
  if (!user) {
    return next(new AppErorr('Token invalid or expired', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.resetPasswordToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save(); // we need validation for user here.

  //update changePasswordAt

  //log user in and sent JWT
  CreateSendToken(user, 200, res);
});

exports.UpdatePassword = CatchAsync(async (req, res, next) => {
  // get User.
  const user = await User.findById(req.user.id).select('+password');

  // Check if Posted password is correct
  const validPassword = await user.correctPassword(
    req.body.currentPassword,
    user.password
  );

  // update the password if password is correct.
  if (!validPassword) {
    return next(new AppErorr('invalid Password! please Try again.', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // send new JWT
  CreateSendToken(user, 200, res);
});
