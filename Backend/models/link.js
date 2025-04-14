const mongoose = require('mongoose')
const connectDB = require('../db/db')

const { linkdB } = connectDB();

const linksSchema = new mongoose.Schema({
    link: {
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
            default: 300
        },
        height: {
            type: Number,
            default: 300
        },
    }
},
    { timestamps: true }
)

linksSchema.index({ link: 1, categoryId: 1, userId: 1, position: 1}, { unique: true })

const Link = linkdB.model('Notes', linksSchema)
module.exports = Link 