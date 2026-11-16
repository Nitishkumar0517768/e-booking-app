const Notification = require('../models/Notification');

const createNotification = async ({ userId, bookingId, title, message, type }) => {
  try {
    const notification = await Notification.create({
      userId,
      bookingId: bookingId || null,
      title,
      message,
      type: type || 'general',
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error('[Notification Creation Error]:', error.message);
    return null;
  }
};

module.exports = {
  createNotification,
};

