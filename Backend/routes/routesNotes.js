const express = require('express')
const router = express.Router();
const { createNotes } = require('../controllers/controllerNotes')

router.post('/createnotes',createNotes )

module.exports = router;