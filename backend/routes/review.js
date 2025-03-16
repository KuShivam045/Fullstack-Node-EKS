const router = require("express").Router()
const controller = require('../controller/review')
const { authenticateToken } = require("../middlewares/auth")

router.get('/', authenticateToken, controller.get)
router.get('/:id', authenticateToken, controller.getById)
router.post('/', authenticateToken, controller.create)
router.put('/:id', authenticateToken, controller.update)
router.delete('/:id', authenticateToken, controller.destroy)

module.exports = router
