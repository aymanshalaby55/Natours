const express = require('express');
const viewController = require('./../Controllers/viewController');
const authController = require('./../Controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewController.getOverview);
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour);
router.get('/login', authController.isLoggedIn, viewController.loginForm);
router.get('/me', authController.protect, viewController.getAccountPage);

router.post(
  '/submit-user-data',
  authController.protect,
  viewController.updateUserData
);

module.exports = router;
