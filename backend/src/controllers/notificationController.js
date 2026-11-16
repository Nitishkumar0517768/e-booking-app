const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { successResponse, errorResponse } = require('../utils/response');

const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id })
      .populate('bookingId')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      isRead: false,
    });

    return successResponse(res, 200, 'Notifications retrieved', {
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error('[Get Notifications Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve notifications');
  }
};

const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid notification ID');
    }

    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { isRead: true } },
      { new: true }
    );

    if (!notification) {
      return errorResponse(res, 404, 'Notification not found');
    }

    return successResponse(res, 200, 'Notification marked as read', {
      notification,
    });
  } catch (error) {
    console.error('[Mark As Read Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to update notification');
  }
};

const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user._id, isRead: false },
      { $set: { isRead: true } }
    );

    return successResponse(res, 200, 'All notifications marked as read');
  } catch (error) {
    console.error('[Mark All As Read Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to update notifications');
  }
};

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};

