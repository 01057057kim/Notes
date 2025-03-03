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
        const { title, content, times, categoryId } = req.body
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
            times,
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

const updateNotes = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const userId = req.session.user.id;
        const { noteId, newTitle, newContent } = req.body;

        if(!noteId){
            return res.status(400).json({
                success: false,
                message: "false Notes ID"
            })
        }

        const updateFields = {};
        if (newTitle !== undefined) {
            updateFields.title = newTitle;
        }

        if (newContent !== undefined) {
            updateFields.content = newContent;
        }
        
        const updatedNote = await Notes.findOneAndUpdate(
            { _id: noteId, userId },
            updateFields,
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notes updated successfully',
            data: updatedNote  
        });
    } catch (err) {
        console.error('Error updating Notes:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating Notes'
        });
    }
}

const updateNotesPosition = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const userId = req.session.user.id;
        const { noteId, position } = req.body;

        if(!noteId){
            return res.status(400).json({
                success: false,
                message: "Invalid Notes ID"
            });
        }

        const updatedNote = await Notes.findOneAndUpdate(
            { _id: noteId, userId },
            { position },
            { new: true }
        );

        if (!updatedNote) {
            return res.status(404).json({
                success: false,
                message: 'Note not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Notes position updated successfully',
            data: updatedNote
        });
    } catch (err) {
        console.error('Error updating Notes position:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating Notes position'
        });
    }
};

module.exports = {
    createNotes,
    getNotes,
    deleteNotes,
    updateNotes,
    updateNotesPosition,
}