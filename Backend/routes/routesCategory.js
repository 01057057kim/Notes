const express = require('express');
const router = express.Router();
const { createCategory, getCategory, deleteCategory } = require('../controllers/controllerCategory');

router.post('/createcategory', createCategory);
router.get('/getcategory', getCategory)
router.delete('/deletecategory', deleteCategory)

module.exports = router;