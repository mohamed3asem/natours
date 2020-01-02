const express = require('express')
const tourController = require('../controllers/tourController')
const authController = require('../controllers/authController')
const reviewRouter = require('./reviewRoutes')

const router = express.Router()

router.route('/top-5-cheap').get(tourController.aliasTopTours, tourController.getAllTours)
router.use('/:tourId/reviews', reviewRouter)

router
    .route('/')
    .get(tourController.getAllTours)
    .post(
        authController.isAuthenticated,
        authController.authorizedTo('admin', 'lead-guide'),
        tourController.createTour
    )

router
    .route('/:id')
    .get(tourController.getTour)
    .patch(
        authController.isAuthenticated,
        authController.authorizedTo('admin', 'lead-guide'),
        tourController.uploadTourImages,
        tourController.resizeTourImages,
        tourController.updateTour
    )
    .delete(
        authController.isAuthenticated,
        authController.authorizedTo('admin', 'lead-guide'),
        tourController.deleteTour
    )

router.route('/tours-within/:distance/center/:latlng/unit/:unit')
    .get(tourController.getToursWithin)

router.route('/distances/:latlng/unit/:unit')
        .get(tourController.getDistances)

module.exports = router

