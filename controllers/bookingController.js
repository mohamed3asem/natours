const stripe = require('stripe')('sk_test_I0bdSqTpSDmXbzwiKNlmALaj00TSmUz92z')
const Tour = require('../models/tourModel')
const catchAsync = require('../utilis/catchAsync')


exports.getChekoutSession =catchAsync( async(req, res) => {
    // 1) get the currently booked tour
    const tour = await Tour.findById(req.params.tourId)
    // 2) Create chekout session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        success_url: `${req.protocol}://${req.get('host')}/`,
        cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
        customer_email: req.user.email,
        client_reference_id: req.params.tourId,
        line_items: [
            {
                name: `${tour.name} tour`,
                description: tour.summary,
                images: [`https://www.natours.dev/img/tours/${tour.imageCover}.jpg`],
                amount: tour.price * 100,
                currency: 'usd',
                quantity: 1
            }
        ]
    })
    // 3) create session as response
    res.status(200).json({
        status: 'success',
        session
    })
})