const express = require('express');
const router = express.Router();
const todoController = require('../controllers/controllerTodo');


router.post('/createtodo', todoController.createTodo);
router.get('/gettodos', todoController.getTodos);
router.put('/updatetodo', todoController.updateTodo);
router.delete('/deletetodo', todoController.deleteTodo);

module.exports = router;