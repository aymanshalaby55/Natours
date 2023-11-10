// USERS Routs
const express = require('express');
const UserControllers = require('./../Controllers/Usercontroller');
const authController = require('./../Controllers/authController');

const rout = express.Router();

rout.post('/signup', authController.signup);
rout.post('/login', authController.login);

rout.post('/forgetPassword', authController.forgetPassword);
rout.patch('/resetPassword/:token', authController.resetPassword);

rout.patch(
  '/updatePassword',
  authController.protect,
  authController.UpdatePassword
);

// rout
//   .route('/')
//   .get(UserControllers.GetAllUsers)
//   .patch(UserControllers.CreateUser);

module.exports = rout;
