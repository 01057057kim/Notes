const Link = require('../models/link');
const Category = require('../models/category');

const createLink = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const { content, categoryId } = req.body;
        const userId = req.session.user.id;

        const category = await Category.findOne({ _id: categoryId, userId });
        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Invalid category'
            });
        }

        const newLink= new Link({
            content,
            categoryId,
            userId
        });

        await newLink.save();

        res.status(200).json({
            success: true,
            message: 'Link created successfully',
            link: newLink
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during link creation'
        });
    }
};

const getLink = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const userId = req.session.user.id;
        const { categoryId } = req.query;

        if (!categoryId) {
            return res.status(400).json({
                success: false,
                message: 'Invalid Category Id'
            });
        }

        const link = await Link.find({ categoryId, userId });
        res.status(200).json({
            success: true,
            link
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({
            success: false,
            message: 'Internal server error during get Link data'
        });
    }
};

const updateLinkText = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { linkId, content } = req.body;
        
        if (!linkId || !content) {
            return res.status(400).json({
                success: false,
                message: "Invalid request parameters"
            });
        }
        
        const updatedLink = await Link.findOneAndUpdate(
            { _id: linkId, userId },
            { content },
            { new: true }
        );
        
        if (!updatedLink) {
            return res.status(404).json({
                success: false,
                message: 'Link not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Link text updated successfully',
            data: updatedLink
        });
    } catch (err) {
        console.error('Error updating link text:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating link text'
        });
    }
};

const deleteLink = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { linkId } = req.query;

        if (!linkId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Link ID"
            });
        }

        const deletedLink = await Link.findOneAndDelete({ _id: linkId, userId });

        if (!deletedLink) {
            return res.status(404).json({
                success: false,
                message: 'Link not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Link deleted successfully'
        });
    } catch (err) {
        console.error('Error deleting link:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while deleting link'
        });
    }
};

const updateLinkPosition = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        
        const userId = req.session.user.id;
        const { linkId, position } = req.body;
        
        if (!linkId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Link ID"
            });
        }
        
        const updatedLink = await Link.findOneAndUpdate(
            { _id: linkId, userId },
            { position },
            { new: true }
        );
        
        if (!updatedLink) {
            return res.status(404).json({
                success: false,
                message: 'link not found'
            });
        }
        
        res.status(200).json({
            success: true,
            message: 'Link position updated successfully',
            data: updatedLink
        });
    } catch (err) {
        console.error('Error updating Link position:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating Link position'
        });
    }
};


module.exports = {
    createLink,
    getLink,
    updateLinkText,
    deleteLink,
    updateLinkPosition,
};
