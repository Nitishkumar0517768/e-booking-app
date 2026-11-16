const mongoose = require('mongoose');
const Booking = require('../models/Booking');
const Resource = require('../models/Resource');
const { getResourceAvailability } = require('../services/availabilityService');
const { createNotification } = require('../services/notificationService');
const { successResponse, errorResponse } = require('../utils/response');

const generateBookingCode = () => {
  const year = new Date().getFullYear();
  const randomPart = Math.floor(1000 + Math.random() * 9000);
  return `EB-${year}-${randomPart}`;
};

/**
 * Automatically recalculates and updates the live available units of a resource
 * based on currently approved or issued bookings.
 */
const syncResourceAvailableQuantity = async (resourceId) => {
  try {
    if (!resourceId) return;
    const targetId = resourceId._id || resourceId;
    const resource = await Resource.findById(targetId);
    if (!resource) return;

    // Count units tied up in active approved or issued bookings
    const activeBookings = await Booking.find({
      resourceId: targetId,
      status: { $in: ['Approved', 'Issued'] },
    });

    const bookedQuantity = activeBookings.reduce((sum, b) => sum + (b.quantity || 1), 0);
    const updatedAvailable = Math.max(0, resource.totalQuantity - bookedQuantity);

    resource.availableQuantity = updatedAvailable;
    await resource.save();
    return resource;
  } catch (err) {
    console.error('[Sync Available Units Error]:', err);
  }
};

const createBooking = async (req, res) => {
  const { resourceId, quantity, startAt, endAt, purpose } = req.body;
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);
  const now = new Date();

  // 1. Basic validation
  if (startDate <= now) {
    return errorResponse(res, 400, 'Start date and time must be in the future');
  }

  if (endDate <= startDate) {
    return errorResponse(res, 400, 'End date and time must be later than start date and time');
  }

  // 2. Concurrency write guard with MongoDB Transaction
  const session = await mongoose.startSession();
  try {
    let newBooking;
    let resource;

    await session.withTransaction(async () => {
      // Step A: Atomically increment bookingVersion on the resource to lock concurrency
      resource = await Resource.findOneAndUpdate(
        { _id: resourceId, isArchived: false },
        { $inc: { bookingVersion: 1 } },
        { session, new: true }
      );

      if (!resource) {
        throw new Error('RESOURCE_NOT_FOUND');
      }

      if (resource.operationalStatus !== 'available') {
        throw new Error(`RESOURCE_UNAVAILABLE:${resource.operationalStatus}`);
      }

      if (quantity > resource.totalQuantity) {
        throw new Error(`QUANTITY_EXCEEDS_INVENTORY:Requested ${quantity}, inventory is ${resource.totalQuantity}`);
      }

      // Step B: Calculate accurate sweep-line availability inside transaction
      const availability = await getResourceAvailability(resource, startDate, endDate, session);

      if (availability.availableQuantity < quantity) {
        throw new Error(`INSUFFICIENT_AVAILABILITY:Only ${availability.availableQuantity} available for this time range`);
      }

      // Step C: Generate unique code and create booking inside transaction
      let code = generateBookingCode();
      let codeExists = await Booking.findOne({ bookingCode: code }).session(session);
      while (codeExists) {
        code = generateBookingCode();
        codeExists = await Booking.findOne({ bookingCode: code }).session(session);
      }

      const bookingDocs = await Booking.create(
        [
          {
            bookingCode: code,
            userId: req.user._id,
            resourceId: resource._id,
            quantity,
            startAt: startDate,
            endAt: endDate,
            purpose,
            status: 'Pending',
          },
        ],
        { session }
      );

      newBooking = bookingDocs[0];
    });

    await session.endSession();

    // Send in-app notification to student
    await createNotification({
      userId: req.user._id,
      bookingId: newBooking._id,
      title: 'Booking Request Submitted',
      message: `Your booking request ${newBooking.bookingCode} for ${resource.name} (${quantity} units) has been submitted and is pending administrator approval.`,
      type: 'booking_submitted',
    });

    const populated = await Booking.findById(newBooking._id).populate('resourceId');

    return successResponse(res, 201, 'Booking request submitted successfully', {
      booking: populated,
    });
  } catch (error) {
    await session.endSession();
    console.error('[Create Booking Error]:', error.message);

    if (error.message === 'RESOURCE_NOT_FOUND') {
      return errorResponse(res, 404, 'The requested resource was not found');
    }
    if (error.message.startsWith('RESOURCE_UNAVAILABLE:')) {
      const status = error.message.split(':')[1];
      return errorResponse(res, 400, `This resource is currently ${status} and cannot be booked`);
    }
    if (error.message.startsWith('QUANTITY_EXCEEDS_INVENTORY:')) {
      return errorResponse(res, 400, error.message.replace('QUANTITY_EXCEEDS_INVENTORY:', ''));
    }
    if (error.message.startsWith('INSUFFICIENT_AVAILABILITY:')) {
      return errorResponse(res, 409, error.message.replace('INSUFFICIENT_AVAILABILITY:', ''));
    }

    return errorResponse(res, 500, error.message || 'Failed to submit booking request');
  }
};

const getMyBookings = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { userId: req.user._id };

    if (status && status !== 'All') {
      if (status === 'Overdue') {
        // Computed filter
        query.status = 'Issued';
        query.endAt = { $lt: new Date() };
      } else {
        query.status = status;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('resourceId')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Augment with computed overdue status if applicable
    const augmented = bookings.map((b) => {
      const doc = b.toObject();
      if (doc.status === 'Issued' && new Date(doc.endAt) < new Date()) {
        doc.isOverdue = true;
      } else {
        doc.isOverdue = false;
      }
      return doc;
    });

    return successResponse(res, 200, 'Student bookings retrieved', {
      bookings: augmented,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('[Get My Bookings Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve bookings');
  }
};

const getAllBookings = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'All') {
      if (status === 'Overdue') {
        query.status = 'Issued';
        query.endAt = { $lt: new Date() };
      } else {
        query.status = status;
      }
    }

    if (search && search.trim() !== '') {
      query.bookingCode = new RegExp(search.trim(), 'i');
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Booking.countDocuments(query);
    const bookings = await Booking.find(query)
      .populate('resourceId')
      .populate('userId', 'name email studentId department phone')
      .populate('approvedBy', 'name email')
      .populate('issuedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const augmented = bookings.map((b) => {
      const doc = b.toObject();
      if (doc.status === 'Issued' && new Date(doc.endAt) < new Date()) {
        doc.isOverdue = true;
      } else {
        doc.isOverdue = false;
      }
      return doc;
    });

    return successResponse(res, 200, 'All bookings retrieved', {
      bookings: augmented,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('[Get All Bookings Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve bookings');
  }
};

const getBookingById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid booking ID');
    }

    const booking = await Booking.findById(id)
      .populate('resourceId')
      .populate('userId', 'name email studentId department phone')
      .populate('approvedBy', 'name email')
      .populate('issuedBy', 'name email');

    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    // Role ownership check
    if (req.user.role !== 'admin' && booking.userId._id.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Access denied: You do not own this booking');
    }

    const doc = booking.toObject();
    if (doc.status === 'Issued' && new Date(doc.endAt) < new Date()) {
      doc.isOverdue = true;
    } else {
      doc.isOverdue = false;
    }

    return successResponse(res, 200, 'Booking details retrieved', {
      booking: doc,
    });
  } catch (error) {
    console.error('[Get Booking Details Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve booking');
  }
};

const cancelBooking = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid booking ID');
    }

    const booking = await Booking.findById(id).populate('resourceId');
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (req.user.role !== 'admin' && booking.userId.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, 'Access denied: You can only cancel your own booking');
    }

    if (!['Pending', 'Approved'].includes(booking.status)) {
      return errorResponse(res, 400, `Cannot cancel booking with status: ${booking.status}`);
    }

    if (new Date() >= new Date(booking.startAt)) {
      return errorResponse(res, 400, 'Cannot cancel a booking that has already started');
    }

    booking.status = 'Cancelled';
    await booking.save();

    // Automatically recalculate & restore available units if this booking was Approved
    await syncResourceAvailableQuantity(booking.resourceId);

    await createNotification({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Booking Cancelled',
      message: `Booking ${booking.bookingCode} for ${booking.resourceId.name} has been cancelled.`,
      type: 'booking_cancelled',
    });

    return successResponse(res, 200, 'Booking cancelled successfully', {
      booking,
    });
  } catch (error) {
    console.error('[Cancel Booking Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to cancel booking');
  }
};

const decisionBooking = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks, rejectionReason } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid booking ID');
    }

    const booking = await Booking.findById(id).populate('resourceId');
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status !== 'Pending') {
      return errorResponse(res, 400, `Cannot approve/reject booking with current status: ${booking.status}`);
    }

    if (action === 'approve') {
      booking.status = 'Approved';
      booking.approvedBy = req.user._id;
      if (remarks) booking.adminRemarks = remarks;
      await booking.save();

      // Automatically deduct & update number of units for the resource
      await syncResourceAvailableQuantity(booking.resourceId);

      await createNotification({
        userId: booking.userId,
        bookingId: booking._id,
        title: 'Booking Approved',
        message: `Your booking request ${booking.bookingCode} for ${booking.resourceId.name} has been APPROVED!`,
        type: 'booking_approved',
      });

      return successResponse(res, 200, 'Booking approved successfully', { booking });
    } else if (action === 'reject') {
      booking.status = 'Rejected';
      booking.rejectionReason = rejectionReason;
      if (remarks) booking.adminRemarks = remarks;
      await booking.save();

      // Recalculate available units
      await syncResourceAvailableQuantity(booking.resourceId);

      await createNotification({
        userId: booking.userId,
        bookingId: booking._id,
        title: 'Booking Request Rejected',
        message: `Your booking request ${booking.bookingCode} was rejected. Reason: ${rejectionReason}`,
        type: 'booking_rejected',
      });

      return successResponse(res, 200, 'Booking request rejected', { booking });
    }
  } catch (error) {
    console.error('[Decision Booking Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to process decision');
  }
};

const issueEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid booking ID');
    }

    const booking = await Booking.findById(id).populate('resourceId');
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status !== 'Approved') {
      return errorResponse(res, 400, `Cannot issue equipment for booking with status: ${booking.status}. Must be Approved.`);
    }

    if (!booking.resourceId.requiresIssueReturn) {
      return errorResponse(res, 400, 'This resource does not require physical issuing/returning');
    }

    booking.status = 'Issued';
    booking.issuedBy = req.user._id;
    booking.issuedAt = new Date();
    if (remarks) booking.adminRemarks = remarks;
    await booking.save();

    await createNotification({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Equipment Issued',
      message: `Equipment for booking ${booking.bookingCode} (${booking.resourceId.name}) has been issued to you. Please ensure return by ${new Date(booking.endAt).toLocaleString()}.`,
      type: 'equipment_issued',
    });

    return successResponse(res, 200, 'Equipment marked as issued', { booking });
  } catch (error) {
    console.error('[Issue Equipment Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to issue equipment');
  }
};

const returnEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const { remarks, condition } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid booking ID');
    }

    const booking = await Booking.findById(id).populate('resourceId');
    if (!booking) {
      return errorResponse(res, 404, 'Booking not found');
    }

    if (booking.status !== 'Issued') {
      return errorResponse(res, 400, `Cannot return equipment for booking with status: ${booking.status}. Must be Issued.`);
    }

    booking.status = 'Returned';
    booking.returnedAt = new Date();
    if (condition) booking.returnCondition = condition;
    if (remarks) {
      booking.adminRemarks = remarks;
    } else if (condition) {
      booking.adminRemarks = `Returned in ${condition} condition.`;
    }
    await booking.save();

    // Automatically restore available units now that item is checked back in
    await syncResourceAvailableQuantity(booking.resourceId);

    await createNotification({
      userId: booking.userId,
      bookingId: booking._id,
      title: 'Equipment Returned',
      message: `Equipment for booking ${booking.bookingCode} (${booking.resourceId.name}) has been returned and verified. Thank you!`,
      type: 'equipment_returned',
    });

    return successResponse(res, 200, 'Equipment marked as returned', { booking });
  } catch (error) {
    console.error('[Return Equipment Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to return equipment');
  }
};

module.exports = {
  createBooking,
  getMyBookings,
  getAllBookings,
  getBookingById,
  cancelBooking,
  decisionBooking,
  issueEquipment,
  returnEquipment,
  syncResourceAvailableQuantity,
};

