const express = require('express');
const router = express.Router();
const todoController = require('../controllers/controllerTodo');

// 创建待办事项
router.post('/createtodo', todoController.createTodo);

// 获取待办事项
router.get('/gettodos', todoController.getTodos);


module.exports = router;