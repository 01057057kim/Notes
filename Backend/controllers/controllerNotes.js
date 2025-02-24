const Notes = require('../models/notes')
const Category = require('../models/category')

const createNotes = async (req, res) =>{
    try{
        if(!req.session.user){
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        const { title, content, categoryId } = req.body
        const userId = req.session.user.id

        const category = await Category.findOne({ _id: categoryId, userId })
        if(!category){
            return res.status(404).json({
                success: false,
                message: "false category"
            })
        }

        const newNotes = new Notes({
            title,
            content,
            categoryId,
            userId,
        })
        await newNotes.save()
        res.status(200).json({
            success: true,
            message: "Success create notes"
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: 'Internal server error during notes creation'
        })
    }
    
}

module.exports = {
    createNotes,
}