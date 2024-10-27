const express = require('express')
const router = express.Router()
const UsersController = require('../controllers/UsersController')
const RecoverPassController = require('../controllers/recoverPassController')
const AdminAuth = require('../middleware/AdminAuth')
const Auth = require('../middleware/Auth')
const AuthAlterPass = require('../middleware/AuthAlterPass')

router.post('/user', UsersController.create)
router.post('/login', UsersController.login)
router.post('/recover-password', RecoverPassController.request)

router.get('/users', UsersController.findAll)
router.get('/user/:id', Auth, UsersController.findUser)

router.delete('/user/:id', UsersController.remove)

router.put('/user/:id', UsersController.editUser)
router.put('/user-password/:id', AuthAlterPass, UsersController.editPass)


module.exports = router

