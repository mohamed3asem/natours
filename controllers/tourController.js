const multer = require('multer') 
const sharp = require('sharp')
const Tour = require('../models/tourModel')
const catchAsync = require('../utilis/catchAsync')
const APPError = require('../utilis/APPError')
const factory = require('./handlerFactory')

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

exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

exports.resizeTourImages =catchAsync( async(req, res, next) => {
    if(!req.files.imageCover || !req.files.images ) return next()
    
    // 1 cover image
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${req.body.imageCover}`)

    // 2 images
    req.body.images = []
    await Promise.all(req.files.images.map(async (file, i) => {
        const fileName = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`
        await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/tours/${fileName}`)
        req.body.images.push(fileName)
        })
    )
    next()
})

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5'
    req.query.sort = '-ratingsAverage,price'
    next()
}

exports.getToursWithin = catchAsync( async(req, res, next) => {
    const {distance, latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')
    const radius = unit === 'mi' ? distance /3963.2 : distance / 6378.1

    if(!lat, !lng) {
        return new APPError('Please provide latitude and longitude in the format lat,lang', 400)
    }

    const tours = await Tour.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius]} } })

    res.status(200).json({
        status: 'success',
        results: tours.length,
        data : {
            tours
        }
    })
})

exports.getDistances = catchAsync( async(req, res, next) => {
    const { latlng, unit} = req.params
    const [lat, lng] = latlng.split(',')
    const multiplier = unit === 'mi' ? 0.000621371 : 0.001
    if(!lat, !lng) {
        return new APPError('Please provide latitude and longitude in the format lat,lang', 400)
    }

    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier,
                spherical: true
            }
        },
        {
            $project: {
                distance: 1,
                name: 1
            }
        }
    ])

    res.status(200).json({
        status: 'success',
        data : {
            data: distances
        }
    })
})

exports.getAllTours = factory.getAll(Tour)
exports.getTour = factory.getOne(Tour, {path: 'reviews'})
exports.createTour = factory.createOne(Tour)
exports.updateTour = factory.updateOne(Tour)
exports.deleteTour = factory.deleteOne(Tour)
