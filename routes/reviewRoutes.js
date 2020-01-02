const express = require('express')
const reviewController = require('../controllers/reviewController')
const authController = require('../controllers/authController')


const router = express.Router({ mergeParams: true })

router.use(authController.isAuthenticated)

router.route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.authorizedTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview
    )

router.route('/:id')
    .get(reviewController.getReview)
    .delete(authController.authorizedTo('user'), reviewController.deleteReview)
    .patch(authController.authorizedTo('user'), reviewController.updateReview)

module.exports = router