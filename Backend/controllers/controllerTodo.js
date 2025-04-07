const Todo = require('../models/todo');
const Category = require('../models/category');

// Create todo
const createTodo = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const { text, categoryId, completed } = req.body;
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
            userId,
            completed: completed || false
        });
        
        await newTodo.save();
        
        res.status(200).json({
            success: true,
            message: 'Todo created successfully',
            todo: newTodo
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during todo creation'
        });
    }
};

// Get todos
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

// Update todo status
const updateTodoStatus = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const userId = req.session.user.id;
        const { todoId, completed, text } = req.body;

        if (!todoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Todo ID"
            });
        }

        const updateFields = {};
        if (completed !== undefined) {
            updateFields.completed = completed;
        }
        if (text !== undefined) {
            updateFields.text = text;
        }

        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: todoId, userId },
            updateFields,
            { new: true }
        );

        if (!updatedTodo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Todo updated successfully',
            data: updatedTodo
        });
    } catch (err) {
        console.error('Error updating todo:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating todo'
        });
    }
};

// Delete todo
const deleteTodo = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { todoId } = req.query;

        if (!todoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Todo ID"
            });
        }

        const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, userId });

        if (!deletedTodo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Todo deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting todo:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while deleting todo'
        });
    }
};

// Update todo position
const updateTodosPosition = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { todoId, position } = req.body;
        
        if (!todoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Todo ID"
            });
        }
        
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: todoId, userId },
            { position },
            { new: true }
        );
        
        if (!updatedTodo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Todo position updated successfully',
            data: updatedTodo
        });
    } catch (err) {
        console.error('Error updating Todo position:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating Todo position'
        });
    }
};

module.exports = {
    createTodo,
    getTodos,
    updateTodoStatus,
    deleteTodo,
    updateTodosPosition
};