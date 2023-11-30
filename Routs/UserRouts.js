// USERS Routs
const express = require('express');
const UserControllers = require('./../Controllers/Usercontroller');
const authController = require('./../Controllers/authController');

const rout = express.Router();

rout.post('/signup', authController.signup);
rout.post('/login', authController.login);
rout.post('/forgetPassword', authController.forgetPassword);
rout.patch('/resetPassword/:token', authController.resetPassword);

// protect all routs after this middleware
rout.use(authController.protect);
rout.get('/me', UserControllers.getMe, UserControllers.getUser);

rout.route('/').get(UserControllers.GetAllUsers);

rout.patch('/updatePassword', authController.UpdatePassword);

rout.patch('/UpdateMe', UserControllers.UpdateMe);
rout.delete('/DeleteUser', UserControllers.deleteUser);

module.exports = rout;
