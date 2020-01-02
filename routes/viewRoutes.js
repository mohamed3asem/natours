const express = require('express')
const viewController = require('../controllers/viewControllers')
const authController = require('../controllers/authController')

const router = express.Router()

router.get('/', authController.isLoggedIn,  viewController.getOverview)
router.get('/reset-password/:token', authController.isLoggedIn,  viewController.resetPassword)
router.get('/me', authController.isAuthenticated, viewController.getUserForm)
router.get('/my-tours', authController.isAuthenticated, viewController.getMyTours)
router.get('/login', authController.isLoggedIn, viewController.getLoginForm)
router.get('/signup', authController.isLoggedIn, viewController.getSignupForm)
router.get('/forgetPassword', viewController.getForgetPasswordForm)
router.get('/tour/:slug', authController.isLoggedIn, viewController.getTour)

module.exports = router