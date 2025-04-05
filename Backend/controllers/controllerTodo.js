const Todo = require('../models/todo');
const Category = require('../models/category')
// 创建待办事项
const createTodo = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const { text, categoryId } = req.body;
        const userId = req.session.user.id;

        const category = await Category.findOne({ _id: categoryId, userId });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const newTodo = new Todo({
            text,
            categoryId,
            userId
        });

        await newTodo.save();
        res.status(200).json({
            success: true,
            message: 'Todo created successfully'
        });
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Internal server error during todo creation'
        });
    }
};

// 获取待办事项
const getTodos = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const userId = req.session.user.id;
        const { categoryId } = req.query;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Category Id'
            });
        }

        const todos = await Todo.find({ categoryId, userId });
        res.status(200).json({
            success: true,
            todos
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during get todos data'
        });
    }
};

module.exports = {
    createTodo,
    getTodos
};