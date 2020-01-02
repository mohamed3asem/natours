const express = require('express')
const authController = require('../controllers/authController')
const userController = require('../controllers/userController')

const router = express.Router()

router.post('/signup', authController.signUp)
router.post('/login', authController.login)
router.get('/logout', authController.logout)
router.post('/forgotPassword', authController.forgotPassword)
router.patch('/resetPassword/:token', authController.resetPassword)

// protect all routes after this middle ware
router.use(authController.isAuthenticated)
router.patch('/updatePassword', authController.updatePassword)
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe)
router.delete('/deleteMe', userController.deleteMe)
router.get('/me', userController.getMe, userController.getUser)

// restict all the routes to admin
router.use(authController.authorizedTo('admin'))

router.get('/', userController.getAllUsers)
router.delete('/', authController.delete)

router.route('/:id')
    .delete(userController.deleteUser)
    .patch(userController.updateUser)
    .get(userController.getUser)

module.exports = router