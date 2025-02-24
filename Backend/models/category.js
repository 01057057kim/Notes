const mongoose = require('mongoose')
const connectDB = require('../db/db')

const { categoryDB } = connectDB();

const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true,
        },
    userId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Account', 
        required: true,
    }
    },
    {timestamps : true}
)

categorySchema.index( {categoryName: 1, userId: 1},{ unique: true})

const Category = categoryDB.model('Category', categorySchema)
module.exports = Category