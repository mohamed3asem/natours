const mongoose = require('mongoose')

const bookingSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'Booking must belong to a user']
    },
    tour: {
        type: mongoose.Schema.ObjectId,
        ref: 'Tour',
        required: [true, 'Booking must belong to a tour']
    },
    createdAt: {
        type: Date,
        default: Date.now()
    },
    price: {
        type: Number,
        required: [true, 'booking must have aprice']
    },
    paid: {
        type: Boolean,
        default: true
    }
})

bookingSchema.pre('', function (next) {
    this.populate('user').populate({
        path: 'Tour',
        select: 'name'
    })
    next()
})

const Booking = mongoose.model('Booknig', bookingSchema)

module.exports = Booking