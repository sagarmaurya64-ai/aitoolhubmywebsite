
const express = require('express');
const router = express.Router();
const { getTools, getToolAccess } = require('../controllers/toolController');
const { protect } = require('../middleware/authMiddleware');
router.get('/', getTools);
router.get('/:id/access', protect, getToolAccess);
module.exports = router;
