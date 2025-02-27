const express = require('express');
const router = express.Router();
const { createCategory, getCategory, deleteCategory, updateCategory } = require('../controllers/controllerCategory');

router.post('/createcategory', createCategory);
router.get('/getcategory', getCategory)
router.delete('/deletecategory', deleteCategory)
router.put('/updatecategory',updateCategory)

module.exports = router;