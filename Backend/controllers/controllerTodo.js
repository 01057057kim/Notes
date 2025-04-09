const Todo = require('../models/todo');
const Category = require('../models/category');

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

const updateTodoText = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { todoId, text } = req.body;
        
        if (!todoId || !text) {
            return res.status(400).json({
                success: false,
                message: "Invalid request parameters"
            });
        }
        
        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: todoId, userId },
            { text },
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
            message: 'Todo text updated successfully',
            data: updatedTodo
        });
    } catch (err) {
        console.error('Error updating todo text:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating todo text'
        });
    }
};
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

// Add these functions to your existing todo controller file

const addSubTodo = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { todoId, text, completed } = req.body;
        
        if (!todoId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Todo ID"
            });
        }
        
        const todo = await Todo.findOne({ _id: todoId, userId });
        
        if (!todo) {
            return res.status(404).json({
                success: false,
                message: 'Todo not found'
            });
        }
        
        const newSubTodo = {
            text: text || 'New subtask',
            completed: completed || false
        };
        
        todo.subTodos.push(newSubTodo);
        await todo.save();
        
        const subTodoId = todo.subTodos[todo.subTodos.length - 1]._id;
        
        res.status(200).json({
            success: true,
            message: 'SubTodo added successfully',
            subTodoId: subTodoId
        });
    } catch (err) {
        console.error('Error adding subtodo:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while adding subtodo'
        });
    }
};

const updateSubTodoStatus = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { todoId, subTodoIndex, completed } = req.body;
        
        if (!todoId || subTodoIndex === undefined) {
            return res.status(400).json({
                success: false,
                message: "Invalid request parameters"
            });
        }
        
        const todo = await Todo.findOne({ _id: todoId, userId });
        
        if (!todo || !todo.subTodos[subTodoIndex]) {
            return res.status(404).json({
                success: false,
                message: 'Todo or SubTodo not found'
            });
        }
        
        todo.subTodos[subTodoIndex].completed = completed;
        await todo.save();
        
        res.status(200).json({
            success: true,
            message: 'SubTodo status updated successfully'
        });
    } catch (err) {
        console.error('Error updating subtodo status:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating subtodo status'
        });
    }
};

const updateSubTodoText = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { todoId, subTodoIndex, text } = req.body;
        
        if (!todoId || subTodoIndex === undefined || !text) {
            return res.status(400).json({
                success: false,
                message: "Invalid request parameters"
            });
        }
        
        const todo = await Todo.findOne({ _id: todoId, userId });
        
        if (!todo || !todo.subTodos[subTodoIndex]) {
            return res.status(404).json({
                success: false,
                message: 'Todo or SubTodo not found'
            });
        }
        
        todo.subTodos[subTodoIndex].text = text;
        await todo.save();
        
        res.status(200).json({
            success: true,
            message: 'SubTodo text updated successfully'
        });
    } catch (err) {
        console.error('Error updating subtodo text:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating subtodo text'
        });
    }
};

const removeSubTodo = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { todoId, subTodoIndex } = req.body;
        
        if (!todoId || subTodoIndex === undefined) {
            return res.status(400).json({
                success: false,
                message: "Invalid request parameters"
            });
        }
        
        const todo = await Todo.findOne({ _id: todoId, userId });
        
        if (!todo || !todo.subTodos[subTodoIndex]) {
            return res.status(404).json({
                success: false,
                message: 'Todo or SubTodo not found'
            });
        }
        
        todo.subTodos.splice(subTodoIndex, 1);
        await todo.save();
        
        res.status(200).json({
            success: true,
            message: 'SubTodo removed successfully'
        });
    } catch (err) {
        console.error('Error removing subtodo:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while removing subtodo'
        });
    }
};

module.exports = {
    createTodo,
    getTodos,
    updateTodoText,
    updateTodoStatus,
    deleteTodo,
    updateTodosPosition,
    addSubTodo,
    updateSubTodoStatus,
    updateSubTodoText,
    removeSubTodo
};
