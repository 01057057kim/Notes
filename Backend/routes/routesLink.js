const express = require('express');
const router = express.Router();
const linkController = require('../controllers/controllerLink');

router.post('/createlink', linkController.createLink);
router.get('/getlink', linkController.getLink);
router.put('/updatelinktext', linkController.updateLinkText);
router.delete('/deletelink', linkController.deleteLink);
router.put('/updatelinkposition', linkController.updateLinkPosition);

module.exports = router;