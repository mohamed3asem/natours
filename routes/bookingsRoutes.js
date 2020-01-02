const express = require('express')
const authController = require('../controllers/authController')
const bookingController = require('../controllers/bookingController')

const router = express.Router()

router.get(
    '/checkout-session/:tourId',
    authController.isAuthenticated,
    bookingController.getChekoutSession
)

module.exports = router