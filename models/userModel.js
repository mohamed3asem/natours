const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'please give us your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'please provide a valid email']
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    password: {
        type: String,
        required: [true, 'Pleasa provide a password'],
        minlength: [8,'Password must be at least 8 characters'],
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Pleasa confirm your password'],
        validate: {
            // only works on save() & create()
            validator: function (el) {
                return el === this.password
            },
            message: 'Passwords are not the same'
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpire: Date,
    active: {
        type: Boolean,
        select: false,
        default: true
    }
})

// userSchema.path('email').validate(async function (value) {
//     const emailCount = await mongoose.models.User.countDocuments({email: value})
//     return !emailCount
// }, 'Email already exists')

// hashing password before save
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next()
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
})

// check if the password id new or updated to add passwordChangedAt
userSchema.pre('save', function(next) {
    if (!this.isModified('password') || this.isNew) return next()
    console.log('pass')
    this.passwordChangedAt = Date.now() - 1000
    next()
})

// to select active users only
userSchema.pre(/^find/, function(next) {
    // this points to the current querry
    this.find({ active: true })
    next()
})

// to check the password
userSchema.methods.isMatched = async function (inputPassword, savedPassword) {
    return await bcrypt.compare(inputPassword, savedPassword)
}

// to check if the password changed after creating the token
userSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
    if(this.passwordChangedAt) {
        // change password time stamp to milli second as jwttimeStamp is in seconds
        const passwordTimeStamp = this.passwordChangedAt.getTime() / 1000
        
        return jwtTimestamp < passwordTimeStamp
    }
    return false
}

// create token to send it via email
userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex')

    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')
    this.passwordResetExpire = Date.now() + 20 * 60 * 1000
    return resetToken
}

const User = mongoose.model('User', userSchema)

module.exports = User