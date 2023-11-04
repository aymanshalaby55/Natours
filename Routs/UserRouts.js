// USERS Routs
const express = require('express');
const UserControllers = require('./../Controllers/Usercontroller');
const authController = require('./../Controllers/authController');

const userRouter = express.Router();

userRouter.post('/signup', authController.signup);

userRouter
  .route('/:id')
  .get(UserControllers.GetAllUsers)
  .patch(UserControllers.CreateUser);

module.exports = userRouter;
