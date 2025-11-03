const express = require('express');
const { join } = require('path');
const { authenticateJWT } = require('../middleware/authenticateJWT');
const router = express.Router();

router.get('/', authenticateJWT, (req, res) => {
  res.sendFile(join(__dirname, '../public/chat.html'));
});

module.exports = router;
