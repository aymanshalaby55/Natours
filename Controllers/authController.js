const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { promisify } = require('util');

const CatchAsync = require('../utils/CatchAsync');
const User = require('./../Models/userModel');
const AppErorr = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const Email = require('./../utils/email');

const signToken = id => {
  return jwt.sign({ id: id }, process.env.JWT_secret, {
    expiresIn: process.env.JWT_Expire
  });
};

const CreateSendToken = (user, code, res) => {
  const token = signToken(user._id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_Cookie_Expire * 24 * 60 * 60 * 1000 // convert it to milleseconds
    ),
    httpOnly: true // can't manipluate cookie in any way in the browser.
  };

  if (process.env.NODE_ENV === 'production') {
    cookieOptions.secure = true;
  }

  res.cookie('jwt', token, cookieOptions);

  user.password = undefined;

  res.status(code).json({
    status: 'success',
    token,
    date: {
      user
    }
  });
};

exports.logout = (req, res) => {
  res.clearCookie('jwt');

  res.status(200).json({ status: 'success' });
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

  const url = `${req.protocol}://${req.get('host')}/me`;
  console.log(url);
  new Email(newUser, url).sendWelcome();
  //remove password apperance when creating document
  newUser.password = undefined;

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
  // const correct = await user.correctPassword(password, user.password);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppErorr('incorrect Email or password', 401));
  }
  console.log(user);
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
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
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
  res.locals.user = freshUser;
  next();
});
// only for render pages
exports.isLoggedIn = CatchAsync(async (req, res, next) => {
  if (req.cookies.jwt) {
    try {
      // 1) verify token
      const decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );

      // 2) Check if user still exists
      const currentUser = await User.findById(decoded.id);
      if (!currentUser) {
        return next();
      }

      // 3) Check if user changed password after the token was issued
      if (currentUser.PasswordChangedAfter(decoded.iat)) {
        return next();
      }

      // THERE IS A LOGGED IN USER
      res.locals.user = currentUser;
      return next();
    } catch (err) {
      //console.log(err);
      return next();
    }
  }
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

  try {
    const resetURL = `${req.protocol}://${req.get(
      'host'
    )}/api/v1/users/resetPassword/${resetToken}`;

    // await sendEmail({
    //   email: user.email,
    //   subject: 'Your password reset token (valid for 10 min)',
    //   message
    // });

    new Email(user, resetURL).sendPasswordReset();
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

  // update the password if password is correct.
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppErorr('Your current password is wrong.', 401));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // send new JWT
  CreateSendToken(user, 200, res);
});
