const Image = require('../models/image');

const getById = async (req, res) => {
    try {
        const { imageId } = req.query;
        
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }
        const userId = req.session.user.id;

        if (!imageId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image ID is required' 
            });
        }
        
        const image = await Image.findById(imageId);
        
        if (!image) {
            return res.status(404).json({ 
                success: false, 
                message: 'Image not found' 
            });
        }
        
        if (image.userId.toString() !== userId.toString()) {
            return res.status(403).json({ 
                success: false, 
                message: 'Not authorized to access this image' 
            });
        }

        if (!image.image || !image.image.data) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image data is missing' 
            })
        }
        
        const imageResponse = {
            _id: image._id,
            name: image.name,
            position: image.position || { x: 0, y: 0, width: 500, height: 281 },
            image: {
                contentType: image.image.contentType,
                data: image.image.data.toString('base64')
            }
        };
        
        return res.status(200).json({ 
            success: true, 
            image: imageResponse 
        })
        
    } catch (error) {
        console.error('Error fetching image by ID:', error);
        return res.status(500).json({ 
            success: false, message: 'Server error', 
            error: error.message 
        });
    }
};

const getImage = async (req, res) => {
    try {
        const categoryId = req.query.categoryId;
        if (!categoryId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Category ID is required' 
            });
        }

        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(400).json({ 
                success: false, 
                message: 'User not logged in' 
            });
        }

        const images = await Image.find({ 
            categoryId: categoryId,
            userId: userId
        });

        const transformedImages = images.map(img => ({
            _id: img._id,
            name: img.name,
            image: {
                contentType: img.image.contentType,
                data: img.image.data.toString('base64')
            },
            position: img.position,
            categoryId: img.categoryId
        }));

        res.json({ 
            success: true, 
            images: transformedImages }
        );
    } catch (error) {
        console.error('Error fetching images:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching images' 
        });
    }
};

const deletedImage = async (req, res) => {
    try {
        const { imageId } = req.body;
        if (!imageId) {
            return res.status(400).json({ 
                success: false, 
                message: 'Image ID is required' 
            });
        }

        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(400).json({
                success: false, 
                message: 'User not logged in' 
            });
        }

        const deletedImage = await Image.findOneAndDelete({ 
            _id: imageId,
            userId: userId
        });

        if (!deletedImage) {
            return res.status(404).json({ 
                success: false, 
                message: 'Image not found' 
            });
        }

        res.json({ 
            success: true, 
            message: 'Image deleted successfully' 
        });
    } catch (error) {
        console.error('Error deleting image:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Error deleting image' 
        });
    }
}

const updateImagePosition = async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(400).json({
                success: false,
                message: 'User not logged in'
            });
        }

        const userId = req.session.user.id;
        const { imageId, position } = req.body;

        if (!imageId) {
            return res.status(400).json({
                success: false,
                message: "Invalid Image ID"
            });
        }

        const updatedImage = await Image.findOneAndUpdate(
            { _id: imageId, userId },
            { position },
            { new: true }
        );

        if (!updatedImage) {
            return res.status(404).json({
                success: false,
                message: 'Image not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Image position updated successfully',
            data: updatedImage
        });
    } catch (err) {
        console.error('Error updating Image position:', err);
        res.status(500).json({
            success: false,
            message: 'Error occurred while updating Image position'
        });
    }
};


module.exports = { getById, getImage, deletedImage, updateImagePosition };