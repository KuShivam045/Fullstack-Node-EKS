const router = require('express').Router()
const controller = require('../controller/user')
const {authenticateToken} = require('../middlewares/auth')

router.get('/all', controller.getAllUsers)
router.post('/userrole', controller.getUsersByRole)
router.post('/register', controller.registerUser)
router.post('/login', controller.login)
router.get('/details', authenticateToken, controller.details)
router.post('/forgetPassword', controller.forgetPassword)

module.exports = router