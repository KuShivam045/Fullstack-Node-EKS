const router = require("express").Router();
const controller = require("../controller/answer");
const { authenticateToken } = require("../middlewares/auth");

router.get('/', authenticateToken, controller.get)
router.post('/', authenticateToken, controller.create)
router.get('/:id', authenticateToken, controller.getById)
router.put('/:id', authenticateToken, controller.update)
router.delete('/:id', authenticateToken, controller.destroy)

module.exports = router