const Category = require('../models/category')
const Notes = require('../models/notes')

const createCategory = async (req, res) => {
    try{
        if(!req.session.user){
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const { categoryName } = req.body
        const userId = req.session.user.id

        const newCategory = new Category({
            categoryName,
            userId
        });

        await newCategory.save();
        console.log('Category created successfully');
        res.status(201).json({
            success: true,
            message: 'Category created successfully'
        })
    } catch (err) {
        console.error('Failed to create category:', err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during category creation'
        });
    }
}

const getCategory = async (req, res) => {
    try{
        if(!req.session.user){
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        const userId = req.session.user.id
        const categories = await Category.find({userId})

        res.status(200).json({success: true, categories})
    }catch(err){
        console.log(err)
        res.status(500).json({
            success: false,
            message: 'Internal server error during get category data '
        });
    }
}

const deleteCategory = async (req, res) => {
    try{
        if(!req.session.user){
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id
        const categoryId = req.body.id

        const deletedNotes = await Notes.deleteMany({ categoryId, userId }); // for delete notes database if parent got deleted
        
        const category = await Category.findOneAndDelete({ _id: categoryId, userId })
        
        if(!category){
            return res.status(404).json({
                success: false,
                message: "false category"
            })
        }
        
        console.log('Category Deleted:', category);
        res.status(200).json({
            success: true,
            message: `Category and ${deletedNotes.deletedCount} associated notes deleted`
        })
    }catch(err){
        res.status(500).json({
            success: false,
            message: 'Failed to Delete'
        })
    }
}

const updateCategory = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const userId = req.session.user.id;
        const { categoryId, newValue } = req.body;
        
        const category = await Category.findOneAndUpdate(
            { _id: categoryId, userId },
            { categoryName: newValue },
            { new: true }
        );

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found or user does not have permission'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Category updated successfully',
            data: category
        });
    } catch (err) {
        console.error('Error updating category:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating category'
        });
    }
};


module.exports ={
    createCategory,
    getCategory,
    deleteCategory,
    updateCategory,
}