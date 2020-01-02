const express = require('express')
const rateLimit = require('express-rate-limit')
const helmet = require('helmet')
const mongoSanitize = require('express-mongo-sanitize')
const xss = require('xss-clean')
const hpp = require('hpp')
const path = require('path')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const tourRoutes = require('./routes/tourRoutes')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const bookingsRoutes = require('./routes/bookingsRoutes')
const viewRoutes = require('./routes/viewRoutes')
const errorHandler = require('./controllers/errorController')
const APPError = require('./utilis/APPError')

const app = express()

app.set('view engine', 'pug')
app.set('views', path.join(__dirname,'views'))

app.use(express.static(path.join(__dirname, 'public')))

// ====GLOBAL MIDDLEWARES====
// set security HTTP HEADERS
app.use(helmet())

//limit requests from same api
const limiter = rateLimit({
    max: 100,
    windowMs: 60 * 60 * 1000,
    message: 'Too many requests from this IP, Please try again in an hour'
})
app.use(limiter)

// body parser
app.use(express.json({ limit: '10kb' }))
app.use(cookieParser())

// data sanitization againt NOSQL query injection
app.use(mongoSanitize())

// data sanitization  againt XSS
app.use(xss())

//  prevent parameter pollution
app.use(hpp({
    whitelist: ['duration', 'maxGroupSize', 'ratingsAverage', 'ratingQuantity', 'difficulty', 'price']
}))

// allow cors
app.use(cors({
    origin: 'http://127.0.0.1:3000',
    preflightContinue: false,
}))


// =====ROUTES========
app.use('/',viewRoutes)
app.use('/api/v1/tours',tourRoutes)
app.use('/api/v1/users',userRoutes)
app.use('/api/v1/reviews',reviewRoutes)
app.use('/api/v1/bookings',bookingsRoutes)
app.use(errorHandler)
app.all('*', (req, res, next) => {
    next(new APPError(`Can't find ${req.originalUrl} on this server`, 404)) 
})

module.exports = app