const mongoose = require('mongoose')
const connectDB = require('../db/db')

const { linkdB } = connectDB();

const linksSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true,
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId, ref: 'Category',
        required: true,
    },
    userId: {
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
        width: {
            type: Number,
            default: 400
        },
        height: {
            type: Number,
            default: 100
        },
    }
},
    { timestamps: true }
)

linksSchema.index({ content: 1, categoryId: 1, userId: 1, position: 1}, { unique: true })

const Link = linkdB.model('Link', linksSchema)
module.exports = Link 