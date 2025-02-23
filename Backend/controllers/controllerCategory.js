const Category = require('../models/category')

const createCategory = async (req, res) => {
    try{
        const { categoryName } = req.body
        const existingCategory = await Category.findOne({categoryName})

        if(existingCategory){
            return res.status(400).json({
                success: false,
                message: 'Category already exists'
            });
        }

        const newCategory = new Category({
            categoryName
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
        const Category = await Category.find()
        res.json(Category)
    }catch(err){
        console.log(err)
    }
}

module.exports ={
    createCategory,
    getCategory,
}