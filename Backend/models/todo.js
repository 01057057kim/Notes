const mongoose = require('mongoose');
const connectDB = require('../db/db');

const { todoDB } = connectDB();

const todoSchema = new mongoose.Schema({
    text: {
        type: String,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
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
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
        width: { type: Number, default: 250 },
        height: { type: Number, default: 200 }
    }
}, { timestamps: true });

todoSchema.index({ text: 1, completed: 1, categoryId: 1, userId: 1 }, { unique: true });

const Todo = todoDB.model('Todo', todoSchema);
module.exports = Todo;