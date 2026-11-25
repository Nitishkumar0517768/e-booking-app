const mongoose = require('mongoose');

const resourceSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Resource name is required'],
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'Electronics',
        'Laboratory Equipment',
        'Sports Equipment',
        'Rooms and Facilities',
        'Other Resources',
      ],
      index: true,
    },
    resourceType: {
      type: String,
      enum: ['equipment', 'room', 'facility'],
      default: 'equipment',
    },
    imageUrl: {
      type: String,
      default: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&auto=format&fit=crop&q=60',
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    location: {
      type: String,
      required: [true, 'Location is required'],
      trim: true,
    },
    totalQuantity: {
      type: Number,
      required: [true, 'Total quantity is required'],
      min: [1, 'Total quantity must be at least 1'],
      default: 1,
    },
    availableQuantity: {
      type: Number,
      min: [0, 'Available quantity cannot be negative'],
      default: function () {
        return this.totalQuantity;
      },
    },
    condition: {
      type: String,
      enum: ['New', 'Good', 'Fair', 'Maintenance Required'],
      default: 'Good',
    },
    operationalStatus: {
      type: String,
      enum: ['available', 'maintenance', 'inactive'],
      default: 'available',
      index: true,
    },
    requiresIssueReturn: {
      type: Boolean,
      default: true,
    },
    bookingVersion: {
      type: Number,
      default: 0,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

resourceSchema.index({ name: 'text', description: 'text', department: 'text' });

resourceSchema.pre('save', function (next) {
  if (this.totalQuantity !== undefined && this.totalQuantity !== null) {
    if (this.availableQuantity === undefined || this.availableQuantity === null) {
      this.availableQuantity = this.totalQuantity;
    } else {
      this.availableQuantity = Math.min(Math.max(0, this.availableQuantity), this.totalQuantity);
    }
  }
  next();
});

const Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;

