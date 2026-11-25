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
  restoreResource,
  uploadImage,
} = require('../controllers/resourceController');
const { authenticateToken, optionalAuth, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createResourceSchema,
  updateResourceSchema,
  updateStatusSchema,
} = require('../validators/resourceValidators');

// Public / Authenticated read routes (optionalAuth detects admin callers)
router.get('/', optionalAuth, getResources);
router.get('/:id', optionalAuth, getResourceById);
router.get('/:id/availability', checkAvailability);

// Admin-only management routes
router.post('/upload-image', authenticateToken, requireRole('admin'), uploadImage);
router.post('/', authenticateToken, requireRole('admin'), validate(createResourceSchema), createResource);
router.patch('/:id/restore', authenticateToken, requireRole('admin'), restoreResource);
router.patch('/:id', authenticateToken, requireRole('admin'), validate(updateResourceSchema), updateResource);
router.patch('/:id/status', authenticateToken, requireRole('admin'), validate(updateStatusSchema), updateResourceStatus);
router.delete('/:id', authenticateToken, requireRole('admin'), archiveResource);

module.exports = router;
