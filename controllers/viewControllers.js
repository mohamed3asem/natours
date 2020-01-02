const Tour = require('../models/tourModel')
const Booking = require('../models/bookingModel')
const catchAsync = require('../utilis/catchAsync')
const APPError = require('../utilis/APPError')

exports.getOverview = catchAsync( async (req, res) => {
    // 1) get tour data from collection
    const tours = await Tour.find()


    // 2) render that template using tour data
    res.status(200).render('overview', {
        title: 'all tours',
        tours
    })
})

exports.getMyTours = catchAsync( async (req, res, next) => {
    const bookings = await Booking.find({user: req.user.id})

    const toursId = bookings.map(booking => booking.tour)
    const tours = await Tour.find({_id: {$in: toursId}})

    res.status(200).render('overview', {
        title: 'My tours',
        tours
    })
})

exports.getTour =catchAsync( async(req, res, next) => {
    const tour =await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        feilds: 'review rating user'
    })
    if (!tour) return next(new APPError('There is no tour with that name', 404))

    res.status(200).render('tour', {
        title : tour.name,
        tour
    })
})

exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'log in to your account'
    })
}

exports.getSignupForm = (req, res) => {
    res.status(200).render('signUp', {
        title: 'Sign UP'
    })
}

exports.getForgetPasswordForm = (req, res) => {
    res.status(200).render('forgetPassword', {
        title: 'Forget password'
    })
}

exports.resetPassword = (req, res) => {
    res.status(200).render('resetPassword', {
        title: 'reset password',
        token: req.params.token
    })
}

exports.getUserForm = (req, res) => {
    res.status(200).render('account',
    {
        title: 'Your account'
    })
}