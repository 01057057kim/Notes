const mongoose = require('mongoose');
const connectDB = require('../db/db');

const { todoDB } = connectDB();

const todoItemSchema = new mongoose.Schema({
    completed: {
        type: Boolean,
        default: false
    },
    text: {
        type: String,
        required: true,
        default: ''
    },
    position: {
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        },
        width: {
            type: Number,
            default: 250
        },
        height: {
            type: Number,
            default: 50
        }
    }
});

const todoListSchema = new mongoose.Schema({
    items: [todoItemSchema],
    unique: {
        type: String,
        default: () => new mongoose.Types.ObjectId().toString()
    },
    todoCount: {
        type: Number,
        default: 0
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        required: true
    },
    position: {
        x: {
            type: Number,
            default: 0
        },
        y: {
            type: Number,
            default: 0
        },
        width: {
            type: Number,
            default: 250
        },
        height: {
            type: Number,
            default: 300
        }
    },
    theme: {
        bgColor: {
            type: String,
            default: '#ffffff'
        },
        headerColor: {
            type: String,
            default: '#f0f0f0'
        },
        textColor: {
            type: String,
            default: '#000000'
        },
        font: {
            type: String,
            default: 'Arial, sans-serif'
        }
    }
}, { timestamps: true });

todoListSchema.index(
    { userId: 1, categoryId: 1 },
    { unique: true }
);

const TodoList = todoDB.model('TodoList', todoListSchema);

module.exports = TodoList;