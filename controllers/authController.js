const jwt = require('jsonwebtoken')
const { promisify } = require('util')
const crypto = require('crypto')

const User = require('../models/userModel')
const catchAsync = require('../utilis/catchAsync')
const APPError = require('../utilis/APPError')
const Email = require('../utilis/sendEmail')


const createSendToken = (user, statusCode, res) => {
    const id = user._id
    const token = jwt.sign(
        { id },
        process.env.JWT_SECRET,
        {expiresIn: process.env.JWT_EXPIRES_IN}
    )
    const cookieOptions = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000),
        httpOnly: true
    }
    if (process.env === 'production') cookieOptions.secure = true

    .password = undefined
    res.cookie('jwt', token, cookieOptions)
    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user,
        }
    })
}

exports.signUp = catchAsync(async (req, res, next) => {
    const newUser = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: req.body.password,
        passwordConfirm: req.body.passwordConfirm,
    })
    // send welcome email
    const url = `${req.protocol}://${req.get('host')}/me`
    await new Email(newUser, url).sendWelcome()

    createSendToken(newUser, 201, res)

    
    
})

exports.login = catchAsync( async(req, res, next) => {
    const { email, password } = req.body
    // 1) check if email and password exist
    if(!email || !password) return next(new APPError('Please provide Email and Password', 400))

    // 2) check if the user exist and password correct
    const user = await User.findOne({email}).select('+password')
    if (!user || ! await user.isMatched(password, user.password)) return next(new APPError('Incorrect password or email', 401))

    createSendToken(user, 200, res)
})

exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    })
    res.send('200').json({ status: 'success'})
}

exports.isAuthenticated =catchAsync( async (req, res, next) => {
    // 1) get the token and check if it is existed
    let token
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies.jwt) {
        token = req.cookies.jwt
    }
    if (!token) return next(new APPError('You are not logged in! Please log in to get access', 401))

    // 2) verification the token
    const decoded =  await promisify(jwt.verify)(token, process.env.JWT_SECRET)

    // 3) if user still exists
    const user = await User.findById(decoded.id)
    if (!user) return next(new APPError('sorry! this user is no longer exist', 401))

    // 4) if the user changed the password after the token issued
    if(user.changedPasswordAfter(decoded.iat)) {
        return next(new APPError('Sorry! User has recently changed password! please log in again', 401))
    }

    req.user = user
    res.locals.user = user
    next()
})

exports.isLoggedIn = async (req, res, next) => {
    if (req.cookies.jwt) {
        try {
            // 1) verification the cookie
            const decoded =  await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET)

            // 2) if user still exists
            const user = await User.findById(decoded.id)
            if (!user) return next()

            // 4) if the user changed the password after the token issued
            if(user.changedPasswordAfter(decoded.iat)) {
                return next()
            }

            res.locals.user = user
            return next()
        } catch (err) {
            return next()
        }
    }
    next()
}

exports.authorizedTo = (...roles) => {
    return (req, res, next) => {

        if(!roles.includes(req.user.role)) {
            return next(new APPError('you do not have permission to perform this action', 403))
        }
        next()
    }
}

exports.forgotPassword = catchAsync(async(req, res, next) => {
    // 1) get the user from the posted email
    const user =   await User.findOne({email: req.body.email})
    if (!user) return next(new APPError('there is no user with this Email address', 404))

    // 2) generate the random reset token
    const resetToken = user.createPasswordResetToken()
    // important option that prevent validation
    await user.save({validateBeforeSave: false})

    // 3) send it to user email
    try{
        const resetURL = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`
        await new Email(user, resetURL).sendPasswordReset()
    } catch(err) {
        user.passwordResetToken = undefined
        user.passwordResetExpire = undefined
        await user.save({validateBeforeSave: false})
        return next(new APPError('Sorry! there was an error sending the email. try again later', 500))
    }

    res.status(200).json({
    status: 'success',
    message: 'token sent to email'
    })
})

exports.resetPassword = catchAsync( async (req, res, next) => {
    // 1) get user based on the token
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex')

    const user = await User.findOne({
        passwordResetToken: hashedToken,
        passwordResetExpire: {$gt: Date.now()}
    })

    if (!user) return next(new APPError('token is invalid or has expired', 400))

    user.password = req.body.password
    user.passwordConfirm = req.body.passwordConfirm
    user.passwordResetToken = undefined
    user.passwordResetExpire = undefined
    await user.save()
    // 2) update changed passswordAT property for the user

    // 4) log the user in and send jwt
    createSendToken(user, 200, res)
})

exports.updatePassword = catchAsync(async (req, res, next) => {
    // get the user from collection and select the password
    const user = await User.findById(req.user._id).select('+password')

    if(! await user.isMatched(req.body.currentPassword, user.password)) {
        return next(new APPError('your current password is wrong', 401), )
    }

    user.password = req.body.newPassword
    user.passwordConfirm = req.body.newPasswordConfirm
    await user.save()
    createSendToken(user, 200, res)
})

exports.delete = (catchAsync(async (req, res) => {
    const deletedUsers = await User.deleteMany({})
    res.status(200).json({
        status: 'success',
        data: {
            deletedUsers
        }
    })
}))