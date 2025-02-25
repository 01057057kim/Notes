const express = require('express')
const router = express.Router();
const { createNotes, getNotes, deleteNotes } = require('../controllers/controllerNotes')

router.post('/createnotes', createNotes)
router.get('/getnotes', getNotes)
router.delete('/deletenotes', deleteNotes)

module.exports = router;