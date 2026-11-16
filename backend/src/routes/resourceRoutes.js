const express = require('express');
const router = express.Router();
const {
  getResources,
  getResourceById,
  checkAvailability,
  createResource,
  updateResource,
  updateResourceStatus,
  archiveResource,
  uploadImage,
} = require('../controllers/resourceController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createResourceSchema,
  updateResourceSchema,
  updateStatusSchema,
} = require('../validators/resourceValidators');

// Public / Authenticated read routes
router.get('/', getResources);
router.get('/:id', getResourceById);
router.get('/:id/availability', checkAvailability);

// Admin-only management routes
router.post('/upload-image', authenticateToken, requireRole('admin'), uploadImage);
router.post('/', authenticateToken, requireRole('admin'), validate(createResourceSchema), createResource);
router.patch('/:id', authenticateToken, requireRole('admin'), validate(updateResourceSchema), updateResource);
router.patch('/:id/status', authenticateToken, requireRole('admin'), validate(updateStatusSchema), updateResourceStatus);
router.delete('/:id', authenticateToken, requireRole('admin'), archiveResource);

module.exports = router;

