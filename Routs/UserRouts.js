// USERS Routs
const express = require('express');
const multer = require('multer');
const UserControllers = require('./../Controllers/Usercontroller');
const authController = require('./../Controllers/authController');

const rout = express.Router();

rout.post('/signup', authController.signup);
rout.post('/login', authController.login);
rout.get('/logout', authController.logout);
rout.post('/forgetPassword', authController.forgetPassword);
rout.patch('/resetPassword/:token', authController.resetPassword);

// protect all routs after this middleware
rout.use(authController.protect);

rout.get('/me', UserControllers.getMe, UserControllers.getUser);

rout.patch('/updatePassword', authController.UpdatePassword);

rout.patch(
  '/UpdateMe',
  UserControllers.upLoadUserPhoto,
  UserControllers.resizeUserPhoto,
  UserControllers.UpdateMe
); // photo is the name in the field
rout.delete('/DeleteUser', UserControllers.deleteUser);

rout.route('/').get(UserControllers.GetAllUsers);
module.exports = rout;
