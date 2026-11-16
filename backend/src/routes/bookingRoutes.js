const express = require('express');
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  decisionBooking,
  issueEquipment,
  returnEquipment,
} = require('../controllers/bookingController');
const { authenticateToken, requireRole } = require('../middleware/auth');
const validate = require('../middleware/validate');
const {
  createBookingSchema,
  decisionSchema,
} = require('../validators/bookingValidators');

// All booking routes require authentication
router.use(authenticateToken);

// Student routes
router.post('/', validate(createBookingSchema), createBooking);
router.get('/my', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

// Admin-only routes
router.get('/', requireRole('admin'), getAllBookings);
router.patch('/:id/decision', requireRole('admin'), validate(decisionSchema), decisionBooking);
router.patch('/:id/issue', requireRole('admin'), issueEquipment);
router.patch('/:id/return', requireRole('admin'), returnEquipment);

// Shared / Ownership-verified route (must be below /my)
router.get('/:id', getBookingById);

module.exports = router;

