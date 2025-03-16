const router = require('express').Router()
const controller = require('../controller/likedislike')
const { authenticateToken } = require('../middlewares/auth')

router.post('/', authenticateToken, controller.create)
router.get('/', authenticateToken, controller.getAll)
router.get('/:id', authenticateToken, controller.getById)
router.delete('/:id', authenticateToken, controller.destroy)

module.exports = router