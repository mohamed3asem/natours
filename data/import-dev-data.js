const mongoose = require('mongoose')
const fs = require('fs')
const Tour = require('../models/tourModel')
const User = require('../models/userModel')
const Review = require('../models/reviewModel')


mongoose.connect('mongodb://127.0.0.1:27017/natours', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connected successfully')
})

const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'))
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'))
const reviews = JSON.parse(fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8'))

// import date into database

const importData = async () => {
    try {
        await User.create(users, { validateBeforeSave: false })
        await Review.create(reviews)
        await Tour.create(tours)
        console.log('data successfully loaded')
        process.exit()
    } catch (err) {
        console.log(err)
    }
}

const deleteData = async () => {
    try {
        await User.deleteMany()
        await Tour.deleteMany()
        await Review.deleteMany()
        console.log('data deleted successfully')
        process.exit()
    } catch (err) {
        console.log(err)
    }
}

if (process.argv[2] === '--import') {
    importData()
} else if (process.argv[2] === '--delete') {
    deleteData()
}