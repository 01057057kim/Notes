const express = require('express');
const router = express.Router();
const path = require('path');
const { createCategory, getCategory } = require('../controllers/controllerCategory');

router.post('/createcategory', createCategory);
//router.get('/getcategory', getCategory)

module.exports = router;