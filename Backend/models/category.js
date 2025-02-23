const mongoose = require('mongoose')
const connectDB = require('../db/db')

const { categoryDB } = connectDB();

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        }
    }
)

const Category = categoryDB.model('Category', categorySchema)
module.exports = Category