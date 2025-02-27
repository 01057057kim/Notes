const express = require('express')
const router = express.Router();
const { createNotes, getNotes, deleteNotes, updateNotes } = require('../controllers/controllerNotes')

router.post('/createnotes', createNotes)
router.get('/getnotes', getNotes)
router.delete('/deletenotes', deleteNotes)
router.put('/updatenotes', updateNotes)

module.exports = router;