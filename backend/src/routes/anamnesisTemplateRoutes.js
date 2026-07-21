const express = require('express');
const router = express.Router();
const controller = require('../controllers/anamnesisTemplateController');

// List templates for a company
router.get('/:empresa_id', controller.getTemplates);

// Create a new template
router.post('/', controller.createTemplate);

// Update an existing template (title mostly)
router.put('/:id', controller.updateTemplate);

// Delete a template
router.delete('/:id', controller.deleteTemplate);

module.exports = router;
