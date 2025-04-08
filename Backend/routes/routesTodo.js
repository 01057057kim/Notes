const express = require('express');
const router = express.Router();
const todoController = require('../controllers/controllerTodo');

router.post('/createtodo', todoController.createTodo);
router.get('/gettodo', todoController.getTodos);
router.put('/updatetodo', todoController.updateTodoStatus);
router.delete('/deletetodo', todoController.deleteTodo);
router.put('/updatetodoposition', todoController.updateTodosPosition);

module.exports = router;