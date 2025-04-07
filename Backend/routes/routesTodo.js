const express = require('express');
const router = express.Router();
const todoController = require('../controllers/controllerTodo');

router.post('/create', todoController.createTodo);
router.get('/get', todoController.getTodos);
router.put('/update', todoController.updateTodoStatus);
router.delete('/delete', todoController.deleteTodo);
router.put('/updateposition', todoController.updateTodosPosition);

module.exports = router;