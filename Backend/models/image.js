const mongoose = require('mongoose')
const connectDB = require('../db/db')

const { imageDB } = connectDB();

const imageSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
    },
    image:{
        data: Buffer,
        contentType: String
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
            default:250
        },
        height:{
            type: Number,
            default: 250
        },
    }},
    {timestamps : true}
)

imageSchema.index({name: 1, image: 1, categoryId: 1, userId: 1, position: 1}, { unique: true})

const Image = imageDB.model('Image', imageSchema)
module.exports = Image