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

const getNotes = async (req, res) => {
    try{
        if(!req.session.user){
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        const userId = req.session.user.id
        const { categoryId } = req.query

        if(!categoryId ){
            return res.status(400).json({
                success: false,
                message: "false Category Id "
            })
        }
        const notes = await Notes.find({ categoryId, userId })
        res.status(200).json({
            success: true,
            notes
        })
    }catch(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message: 'Internal server error during get notes data'
        });
    }
}

const deleteNotes = async (req, res) =>{
    try{
        if(!req.session.user){
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id
        const { noteId } = req.body

        if(!noteId){
            return res.status(400).json({
                success: false,
                message: "false Category Id "
            })
        }

        const notes = await Notes.findOneAndDelete({ _id: noteId, userId})

        if(!notes){
            return res.status(404).json({
                success: false,
                message: "false Notes"
            })
        }

        console.log('Notes Deleted:', notes);
        res.status(200).json({
            success: true,
            message: '"Notes Deleted"'
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: 'Failed to Delete'
        })
    }
}

module.exports = {
    createNotes,
    getNotes,
    deleteNotes,
}