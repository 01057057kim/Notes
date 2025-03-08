const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const Image = require('../models/image');
const { getById, getImage, deletedImage, updateImagePosition } = require('../controllers/controllerImages');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadsDir = path.join(__dirname, '../uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const isValidMimeType = allowedTypes.test(file.mimetype.split('/')[1]);
    
    if (isValid && isValidMimeType) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type! Only JPEG, PNG, GIF and WEBP are allowed.'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.get('/getById', getById);
router.get('/get', getImage);
router.delete('/delete', deletedImage);
router.put('/updateposition', updateImagePosition);
router.post('/upload', upload.single('image'), async (req, res) => {
    try {
        
        const userId = req.session.user?.id;
        if (!userId) {
            return res.status(400).json({ success: false, message: 'User not logged in' });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        if (!req.body.categoryId) {
            return res.status(400).json({ success: false, message: 'Category ID is required' });
        }

        const imageObj = {
            name: req.body.name || 'Untitled',
            image: {
                data: fs.readFileSync(req.file.path),
                contentType: req.file.mimetype
            },
            categoryId: req.body.categoryId,
            userId: userId,
            position: {
                x: req.body.x || 0,
                y: req.body.y || 0,
                width: req.body.width || 500,
                height: req.body.height || 281
            }
        };
        const newImage = new Image(imageObj);
        await newImage.save();

        fs.unlinkSync(req.file.path);

        res.status(201).json({ 
            success: true, 
            message: 'Image uploaded successfully',
            imageId: newImage._id
        });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ success: false, message: 'Error uploading image' });
    }
});

module.exports = router;