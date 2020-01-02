const multer = require('multer') 
const sharp = require('sharp')
const User = require('../models/userModel')
const catchAsync = require('../utilis/catchAsync')
const APPError = require('../utilis/APPError')
const factory = require('./handlerFactory')

// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'public/img/users')
//     },
//     filename: (req, file, cb) => {
//         const ext = file.mimetype.split('/')[1]
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// })

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
    if(file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new APPError('Not an image please upload only images', 400), false)
    }
}

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
})

exports.uploadUserPhoto = upload.single('photo')

exports.resizeUserPhoto = catchAsync( async(req, res, next)=>{
    if(!req.file) return next()
    
    req.file.fileName = `user-${req.user.id}-${Date.now()}.jpeg`
    
    await sharp(req.file.buffer)
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.fileName}`)

    next()
})

exports.updateMe = catchAsync( async(req, res, next) => {
    // 1) create error if user post password data
    if(req.body.password || req.body.passwordConfirm) {
        return next(new APPError('this route is not for password updates. please use /updatePassword', 400))
    }

    // 2) update user data
    const allowedUpdates = ['name', 'email']
    const bodyObjKeys = Object.keys(req.body)
    const updatedObj = {}
    bodyObjKeys.forEach(key => {
        if(allowedUpdates.includes(key)) {
            updatedObj[key] = req.body[key]
        }
    })
    if(req.file) updatedObj.photo = req.file.fileName
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updatedObj, {new: true, runValidators: true})

    res.status(200).json({
        status: 'success',
        data: {
            updatedUser
        }
    })
})

exports.deleteMe = catchAsync( async(req, res) => {
    await User.findByIdAndUpdate(req.user._id, { active : false})

    res.status(204).json({
        status: 'success',
        data: null,
    })
})

exports.getMe = (req, res, next) => {
    req.params.id = req.user._id
    next()
}

exports.getAllUsers = factory.getAll(User)
exports.getUser = factory.getOne(User)
exports.updateUser = factory.updateOne(User)
exports.deleteUser = factory.deleteOne(User)