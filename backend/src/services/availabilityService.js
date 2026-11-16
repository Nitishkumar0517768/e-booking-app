const Booking = require('../models/Booking');

/**
 * Calculates the maximum concurrent reserved quantity during [requestedStart, requestedEnd)
 * using an interval sweep-line algorithm.
 * 
 * Active statuses that reserve inventory: ['Pending', 'Approved', 'Issued']
 */
const calculateMaxConcurrentReserved = (overlappingBookings, requestedStart, requestedEnd) => {
  const reqStartTime = new Date(requestedStart).getTime();
  const reqEndTime = new Date(requestedEnd).getTime();

  let currentConcurrent = 0;
  const events = [];

  for (const booking of overlappingBookings) {
    const bStart = new Date(booking.startAt).getTime();
    const bEnd = new Date(booking.endAt).getTime();
    const qty = booking.quantity;

    // If the booking started before or at requestedStart and is still running after requestedStart
    if (bStart <= reqStartTime && bEnd > reqStartTime) {
      currentConcurrent += qty;
    }

    // Event when a booking starts strictly inside the requested window
    if (bStart > reqStartTime && bStart < reqEndTime) {
      events.push({ time: bStart, delta: qty });
    }

    // Event when a booking ends strictly inside the requested window
    if (bEnd > reqStartTime && bEnd < reqEndTime) {
      events.push({ time: bEnd, delta: -qty });
    }
  }

  let maxConcurrent = currentConcurrent;

  // Sort events chronologically.
  // When times are equal, release inventory first (delta < 0 before delta > 0)
  // because intervals are half-open: [start, end).
  events.sort((a, b) => {
    if (a.time !== b.time) {
      return a.time - b.time;
    }
    return a.delta - b.delta;
  });

  for (const ev of events) {
    currentConcurrent += ev.delta;
    if (currentConcurrent > maxConcurrent) {
      maxConcurrent = currentConcurrent;
    }
  }

  return maxConcurrent;
};

/**
 * Queries MongoDB for overlapping active bookings and returns available quantity.
 */
const getResourceAvailability = async (resource, startAt, endAt, session = null) => {
  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  // Overlap condition: existing.startAt < requested.endAt AND existing.endAt > requested.startAt
  const overlapQuery = {
    resourceId: resource._id,
    status: { $in: ['Pending', 'Approved', 'Issued'] },
    startAt: { $lt: endDate },
    endAt: { $gt: startDate },
  };

  const bookingQuery = Booking.find(overlapQuery);
  if (session) {
    bookingQuery.session(session);
  }

  const overlappingBookings = await bookingQuery.exec();

  const maxReserved = calculateMaxConcurrentReserved(overlappingBookings, startDate, endDate);
  const availableQuantity = Math.max(0, resource.totalQuantity - maxReserved);

  return {
    totalQuantity: resource.totalQuantity,
    maxReserved,
    availableQuantity,
    overlappingCount: overlappingBookings.length,
  };
};

module.exports = {
  calculateMaxConcurrentReserved,
  getResourceAvailability,
};

