const express = require('express')
const router = express.Router();
const { createNotes, getNotes, deleteNotes, updateNotes, updateNotesPosition, updateNotesTheme} = require('../controllers/controllerNotes')

router.post('/createnotes', createNotes)
router.get('/getnotes', getNotes)
router.delete('/deletenotes', deleteNotes)
router.put('/updatenotes', updateNotes)
router.put('/updatenotesposition', updateNotesPosition)
router.put('/updatenotestheme', updateNotesTheme)

module.exports = router;