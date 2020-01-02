const APPError = require('../utilis/APPError')

const sendErrorDev = (err, req, res) => {
    // api
    if (req.originalUrl.startsWith('/api')) {
        res.status(err.statusCode).json({
        status: err.status,
        message: err.message,
        error: err,
        stack: err.stack
    }) 
    }  else {
        // rendered website
        console.error(err.statusCode, err)
        res.status(err.statusCode).render('error', {
            title: 'Something go qrong',
            message: err.message
        })
    }
}

const sendErrorProd = (err, req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        // API
        if (err.isOperational) {
            return res.status(err.statusCode).json({
                status: err.status,
                message: err.message
            })
        } else {
            console.error('Error', err)
            return res.status(500).json({
                status: 'Error',
                message: 'sorry! something go wrong'
            })
        }
    }
    // rendered website
    // operational, trusted error
    if (err.isOperational) {
        return res.status(err.statusCode).render('error',{
            title: 'Something went wrong',
            message: err.message
        })
    }
    // programming or unknown error
    console.error('Error', err)
    return res.status(err.statusCode).render('error',{
        title: 'Something went wrong',
        message: 'please try again later'
    })
}

const handleCAstError = err => {
    const message = `Inavlid ${err.path}: ${err.value}`
    return new APPError(message, 400)
}

const handleDuplicatFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(?:(?=(\\?))\2.)*?\1/)[0]
    const message = `Duplicate field value: ${value}. please use another value`
    // const message = `Email is already exists`
    return new APPError(message, 400)
}

const handleValidationError = err => {
    const message = err.message
    return new APPError(message, 400)
}

const handleJWTExpiredError = () => new APPError('Your token has expired!. Please log in again', 401)

const handleJWTError = () => new APPError('Invalid token. Please log in again', 401)

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500
    err.status = err.status || 'Error'
    // let error = {...err}
    // console.log(error.name)
    // console.log(err)
    if (err.name === 'CastError') err = handleCAstError(err)
    if (err.code === 11000) err = handleDuplicatFieldsDB(err)
    if (err.name === 'ValidatorError') err = handleValidationError(err)
    if (err.name === 'JsonWebTokenError') err = handleJWTError()
    if (err.name === 'TokenExpiredError') err = handleJWTExpiredError()
    if (process.env.NODE_ENV === 'development') {
        sendErrorDev(err, req, res)
    } else if (process.env.NODE_ENV === 'production') {
    //    console.log(error.message)
        sendErrorProd(err, req, res)
    }
}