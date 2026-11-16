const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

const getDashboardSummary = async (req, res) => {
  try {
    const now = new Date();

    const [
      totalResources,
      activeResources,
      maintenanceResources,
      totalBookings,
      pendingRequests,
      approvedBookings,
      issuedEquipment,
      overdueEquipment,
      totalStudents,
      recentActivity,
    ] = await Promise.all([
      Resource.countDocuments({ isArchived: false }),
      Resource.countDocuments({ isArchived: false, operationalStatus: 'available' }),
      Resource.countDocuments({ isArchived: false, operationalStatus: 'maintenance' }),
      Booking.countDocuments(),
      Booking.countDocuments({ status: 'Pending' }),
      Booking.countDocuments({ status: 'Approved' }),
      Booking.countDocuments({ status: 'Issued' }),
      Booking.countDocuments({ status: 'Issued', endAt: { $lt: now } }),
      User.countDocuments({ role: 'student' }),
      Booking.find()
        .populate('resourceId', 'name category imageUrl')
        .populate('userId', 'name email studentId')
        .sort({ createdAt: -1 })
        .limit(8),
    ]);

    return successResponse(res, 200, 'Admin dashboard summary retrieved', {
      statistics: {
        totalResources,
        activeResources,
        maintenanceResources,
        totalBookings,
        pendingRequests,
        approvedBookings,
        issuedEquipment,
        overdueEquipment,
        totalStudents,
      },
      recentActivity,
    });
  } catch (error) {
    console.error('[Admin Dashboard Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve dashboard summary');
  }
};

module.exports = {
  getDashboardSummary,
};

