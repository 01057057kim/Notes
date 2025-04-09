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
    times:{
        type: String,
        require: true,
    },
    categoryId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Category', 
        required: true,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId, ref: 'Account', 
        required: true,
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
        width:{
            type: Number,
            default:300
        },
        height:{
            type: Number,
            default: 300
        },
    },
    theme: {
        bgColor: String,
        secondaryBgColor: String,
        titleColor: String,
        contentColor: String,
        titleFont: String,
        contentFont: String,
        titleSize: String,
        contentSize: String
    }
    },
    {timestamps : true}
)

notesSchema.index( {title: 1, content: 1, times: 1 , categoryId: 1, userId: 1, position: 1, theme: 1},{ unique: true})

const Notes = notesDB.model('Notes', notesSchema)
module.exports = Notes 