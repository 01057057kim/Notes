const mongoose = require('mongoose')
const connectDB = require('../db/db')

const { notesDB } = connectDB();

const notesSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true,
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Category', 
        required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Account', 
        required: true,
    }
    },
    {timestamps : true}
)

notesSchema.index( {title: 1, content: 1, categoryId: 1, userId: 1},{ unique: true})

const Notes = notesDB.model('Notes', notesSchema)
module.exports = Notes 