const express = require('express')
const router = express.Router()
const UsersController = require('../controllers/UsersController')
const RecoverPassController = require('../controllers/recoverPassController')
const ExpensesController = require('../controllers/ExpensesController')
const DonationsController = require('../controllers/DonationsController')
const AdminAuth = require('../middleware/AdminAuth')
const Auth = require('../middleware/Auth')
const AuthAlterPass = require('../middleware/AuthAlterPass')

// User routes
router.post('/user', UsersController.create)
router.post('/login', UsersController.login)
router.post('/recover-password', RecoverPassController.request)
router.get('/users', UsersController.findAll)
router.get('/user/:id', Auth, UsersController.findUser)
router.delete('/user/:id', Auth, UsersController.remove)
router.put('/user/:id', UsersController.editUser)
router.put('/user-password/:id', AuthAlterPass, UsersController.editPass)

// Password recovery routes
router.post('/verify-code', RecoverPassController.verifyCode)
router.put('/update-password', RecoverPassController.updatePassword)

// Expense routes
router.post('/expense', AdminAuth, ExpensesController.create)
router.get('/expenses', AdminAuth, ExpensesController.findAll)
router.get('/expense/:id', AdminAuth, ExpensesController.findExpense)
router.put('/expense/:id', AdminAuth, ExpensesController.editExpense)
router.delete('/expense/:id', AdminAuth, ExpensesController.remove)

// Donation routes
router.post('/donation', AdminAuth, DonationsController.create)
router.get('/donations', AdminAuth, DonationsController.findAll)
router.get('/donation/:id', AdminAuth, DonationsController.findDonation)
router.put('/donation/:id', AdminAuth, DonationsController.editDonation)
router.delete('/donation/:id', AdminAuth, DonationsController.remove)

// Add this new route
router.get('/user/me', Auth, UsersController.getCurrentUser)

module.exports = router
