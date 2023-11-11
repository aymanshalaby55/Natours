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

rout.patch('/UpdateMe', authController.protect, UserControllers.UpdateMe);
rout.delete('/DeleteUser', authController.protect, UserControllers.deleteUser);
rout.route('/').get(authController.protect, UserControllers.GetAllUsers);

module.exports = rout;
