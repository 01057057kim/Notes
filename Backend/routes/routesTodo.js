const express = require('express');
const router = express.Router();
const todoController = require('../controllers/controllerTodo');

router.post('/createtodo', todoController.createTodo);
router.get('/gettodo', todoController.getTodos);
router.put('/updatetodotext', todoController.updateTodoText);
router.put('/updatetodostatus', todoController.updateTodoStatus);
router.delete('/deletetodo', todoController.deleteTodo);
router.put('/updatetodoposition', todoController.updateTodosPosition);
router.post('/addsubtodo', todoController.addSubTodo);
router.put('/updatesubtodostatus', todoController.updateSubTodoStatus);
router.put('/updatesubtodotext', todoController.updateSubTodoText);
router.delete('/removesubtodo', todoController.removeSubTodo);

module.exports = router;