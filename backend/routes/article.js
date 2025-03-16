const router = require("express").Router()
const controller = require('../controller/article')
const { authenticateToken } = require("../middlewares/auth")
const { upload } = require("../middlewares/fileUpload")

router.get('/', authenticateToken, controller.getAll)
router.get('/:id', authenticateToken, controller.getById)
router.post('/', authenticateToken, upload.array('images'), controller.create)
router.put('/:id', authenticateToken, upload.array('images'), controller.update)
router.delete('/images', authenticateToken, controller.deleteArticleImage)
router.delete('/:id', authenticateToken, controller.deleteArticle)

module.exports = router