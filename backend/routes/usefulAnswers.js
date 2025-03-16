const router = require('express').Router()
const controller = require('../controller/usefulAnswer')
const { authenticateToken } = require('../middlewares/auth')

router.post('/', authenticateToken, controller.create)
router.get('/', authenticateToken, controller.getAll)
router.get('/:id', authenticateToken, controller.getById)
router.delete('/:id', authenticateToken, controller.destroy)
router.post("/token", controller.generateTokenAgora)

module.exports = router