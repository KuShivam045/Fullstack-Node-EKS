const router = require('express').Router();
const testCont = require('../controller/testController')

router.get('/', testCont.getData)
router.post('/', testCont.postData)
router.put('/', testCont.putData)
router.delete('/', testCont.deleteData)
router.post('/name', testCont.postDataGet)
router.get('/:id', testCont.getDynamic)

module.exports = router