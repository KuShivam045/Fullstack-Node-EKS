const router = require('express').Router()
const controller = require("../controller/questions")
const { authenticateToken } = require('../middlewares/auth')
const { upload } = require('../middlewares/fileUpload')

router.post('/', authenticateToken, controller.create)
router.get('/', authenticateToken, controller.get)
router.get('/:id', authenticateToken, controller.getById)
router.put('/:id', authenticateToken, controller.update)
router.delete('/:id', authenticateToken, controller.destroy)
router.post("/upload", upload.single('avatar'), controller.uploadFile)

module.exports = router