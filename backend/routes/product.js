const router = require('express').Router()
const controller = require('../controller/product')
const { authenticateToken } = require('../middlewares/auth')

router.post('/create',authenticateToken, controller.create)
router.get('/allProducts',authenticateToken, controller.allProducts)
router.get('/:id',authenticateToken, controller.getById)
router.put('/:id',authenticateToken, controller.updateProduct)
router.delete('/:id',authenticateToken, controller.deleteProduct)


module.exports = router