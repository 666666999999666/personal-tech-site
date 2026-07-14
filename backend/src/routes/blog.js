const express = require('express');
const router = express.Router();
const blogController = require('../controllers/blogController');

router.get('/', blogController.getAll);
router.post('/', blogController.create);
router.get('/:id', blogController.getById);
router.put('/:id', blogController.update);
router.delete('/:id', blogController.remove);

module.exports = router;
