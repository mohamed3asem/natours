const dotenv = require('dotenv')
dotenv.config({path: './config.env'})

process.on('uncaughtException', err => {
    console.log('uncaughtException! Shutting down...')
    console.log(err.name, err.message, err)
    process.exit(1)
})

const app = require('./app')
const mongoose = require('mongoose')

mongoose.connect(process.env.DATABASE, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
}).then(() => {
    console.log('DB connected successfully')
})

console.log(process.env.NODE_ENV)

const port = process.env.PORT || 3000
const server = app.listen(port, ()=> {
    console.log('app running on port 3000')
})

process.on('unhandledRejection', err => {
    console.log('unhandledRejection! Shutting down...')
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})

