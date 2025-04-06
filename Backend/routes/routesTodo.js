const express = require('express');
const router = express.Router();
const todoController = require('../controllers/controllerTodo');

router.post('/create', todoController.createTodo);
router.get('/get', todoController.getTodos);


module.exports = router;