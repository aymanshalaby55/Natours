// USERS Routs
const express = require('express');
const TUserControllers = require('./../Controllers/Usercontroller')
const userRouter = express.Router();

userRouter.route('/')
    .get(TUserControllers.GetAllUsers).
    patch(TUserControllers.CreateUser);


module.exports = userRouter;