const Tour = require('../models/tourModel')
const APIFeatures = require('../utilis/APIFeatures')
const catchAsync = require('../utilis/catchAsync')
const APPError = require('../utilis/APPError')

exports.deleteOne = Model => catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id)
    
    if(!doc) return next(new APPError('No document found with that ID', 404))
    res.status(204).json({
        status: 'success',
        data: null
    })
})

exports.updateOne = Model => catchAsync( async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if(!doc) return next(new APPError('No document found with that ID', 404))

    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.createOne = Model => catchAsync( async (req, res, next) => {
    const doc = await Model.create(req.body)
    res.status(201).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getOne = (Model, popOption) => catchAsync( async (req, res, next) => {
    let query = Model.findById(req.params.id)
    if (popOption) query = query.populate(popOption)
    const doc = await query
    if(!doc) return next(new APPError('No document found with that ID', 404))
    res.status(200).json({
        status: 'success',
        data: {
            data: doc
        }
    })
})

exports.getAll = Model => catchAsync( async (req, res, next) => {
    // to allow for nested Get reviews on routes
    let filter = {}
    if(req.params.tourId) filter = { tour: req.params.tourId }

    const features = new APIFeatures(Model.find(filter), req.query).filter().sort().limitFields().pagination()
    // const docs = await features.query.explain()
    const docs = await features.query
    res.status(200).json({
        status: 'success',
        results: docs.length,
        data: {
            data: docs
        }
    })
})