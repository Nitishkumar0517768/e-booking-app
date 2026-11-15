const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    bookingCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
      index: true,
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      default: 1,
    },
    startAt: {
      type: Date,
      required: [true, 'Start date and time are required'],
      index: true,
    },
    endAt: {
      type: Date,
      required: [true, 'End date and time are required'],
      index: true,
    },
    purpose: {
      type: String,
      required: [true, 'Booking purpose is required'],
      trim: true,
      maxlength: 300,
    },
    status: {
      type: String,
      enum: ['Pending', 'Approved', 'Rejected', 'Cancelled', 'Issued', 'Returned'],
      default: 'Pending',
      index: true,
    },
    adminRemarks: {
      type: String,
      trim: true,
      default: '',
    },
    rejectionReason: {
      type: String,
      trim: true,
      default: '',
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    issuedAt: {
      type: Date,
      default: null,
    },
    returnedAt: {
      type: Date,
      default: null,
    },
    returnCondition: {
      type: String,
      enum: ['Good', 'Fair', 'Damaged', 'Missing Parts', 'Acceptable'],
      default: 'Good',
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({ resourceId: 1, startAt: 1, endAt: 1, status: 1 });
bookingSchema.index({ userId: 1, createdAt: -1 });

const Booking = mongoose.model('Booking', bookingSchema);
module.exports = Booking;

