const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const Booking = require('../models/Booking');
const { getResourceAvailability } = require('../services/availabilityService');
const { uploadToCloudinary } = require('../utils/cloudinary');
const { successResponse, errorResponse } = require('../utils/response');

const uploadImage = async (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return errorResponse(res, 400, 'Image data (base64 string) is required');
    }
    const secureUrl = await uploadToCloudinary(image);
    return successResponse(res, 200, 'Image uploaded successfully to Cloudinary', {
      imageUrl: secureUrl,
    });
  } catch (error) {
    console.error('[Upload Image Error]:', error);
    return errorResponse(res, 500, error.message || 'Image upload failed');
  }
};

const checkAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startAt, endAt } = req.query;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid resource ID');
    }

    if (!startAt || !endAt) {
      return errorResponse(res, 400, 'startAt and endAt query parameters are required');
    }

    const startDate = new Date(startAt);
    const endDate = new Date(endAt);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return errorResponse(res, 400, 'Invalid date format');
    }

    if (endDate <= startDate) {
      return errorResponse(res, 400, 'endAt must be later than startAt');
    }

    const resource = await Resource.findOne({ _id: id, isArchived: false });
    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    if (resource.operationalStatus !== 'available') {
      return successResponse(res, 200, 'Resource is not available for booking', {
        operationalStatus: resource.operationalStatus,
        totalQuantity: resource.totalQuantity,
        availableQuantity: 0,
        maxReserved: resource.totalQuantity,
        isBookable: false,
      });
    }

    const availability = await getResourceAvailability(resource, startDate, endDate);

    return successResponse(res, 200, 'Availability calculated successfully', {
      resourceId: resource._id,
      name: resource.name,
      totalQuantity: resource.totalQuantity,
      availableQuantity: availability.availableQuantity,
      maxReserved: availability.maxReserved,
      overlappingCount: availability.overlappingCount,
      isBookable: availability.availableQuantity > 0,
    });
  } catch (error) {
    console.error('[Check Availability Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to check availability');
  }
};

const getResources = async (req, res) => {
  try {
    const { category, search, status, page = 1, limit = 20 } = req.query;
    const query = { isArchived: false };

    // Role-based visibility: default students see only available items or non-inactive
    if (!req.user || req.user.role !== 'admin') {
      query.operationalStatus = { $ne: 'inactive' };
    } else if (status) {
      query.operationalStatus = status;
    }

    if (category && category !== 'All') {
      query.category = category;
    }

    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { department: searchRegex },
        { location: searchRegex },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Resource.countDocuments(query);
    const resources = await Resource.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const enrichedResources = resources.map((r) => {
      const doc = r.toObject ? r.toObject() : r;
      if (doc.availableQuantity === undefined || doc.availableQuantity === null) {
        doc.availableQuantity = doc.totalQuantity;
      }
      return doc;
    });

    return successResponse(res, 200, 'Resources retrieved successfully', {
      resources: enrichedResources,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('[Get Resources Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve resources');
  }
};

const getResourceById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid resource ID');
    }

    const resource = await Resource.findOne({ _id: id, isArchived: false });
    if (!resource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    // Calculate current reserved quantity (active right now)
    const now = new Date();
    const activeBookings = await Booking.find({
      resourceId: id,
      status: { $in: ['Pending', 'Approved', 'Issued'] },
      startAt: { $lte: now },
      endAt: { $gt: now },
    });

    const currentReserved = activeBookings.reduce((sum, b) => sum + b.quantity, 0);
    const currentAvailable = Math.max(0, resource.totalQuantity - currentReserved);

    return successResponse(res, 200, 'Resource details retrieved', {
      resource,
      currentAvailable,
      currentReserved,
    });
  } catch (error) {
    console.error('[Get Resource By ID Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to retrieve resource details');
  }
};

const createResource = async (req, res) => {
  try {
    const resourceData = req.body;
    const newResource = await Resource.create(resourceData);

    return successResponse(res, 201, 'Resource created successfully', {
      resource: newResource,
    });
  } catch (error) {
    console.error('[Create Resource Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to create resource');
  }
};

const updateResource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid resource ID');
    }

    const updatedResource = await Resource.findOneAndUpdate(
      { _id: id, isArchived: false },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedResource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    return successResponse(res, 200, 'Resource updated successfully', {
      resource: updatedResource,
    });
  } catch (error) {
    console.error('[Update Resource Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to update resource');
  }
};

const updateResourceStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { operationalStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid resource ID');
    }

    const updatedResource = await Resource.findOneAndUpdate(
      { _id: id, isArchived: false },
      { $set: { operationalStatus } },
      { new: true }
    );

    if (!updatedResource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    return successResponse(res, 200, 'Resource status updated successfully', {
      resource: updatedResource,
    });
  } catch (error) {
    console.error('[Update Resource Status Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to update resource status');
  }
};

const archiveResource = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return errorResponse(res, 400, 'Invalid resource ID');
    }

    const archivedResource = await Resource.findByIdAndUpdate(
      id,
      { isArchived: true, operationalStatus: 'inactive' },
      { new: true }
    );

    if (!archivedResource) {
      return errorResponse(res, 404, 'Resource not found');
    }

    return successResponse(res, 200, 'Resource archived successfully', {
      resource: archivedResource,
    });
  } catch (error) {
    console.error('[Archive Resource Error]:', error);
    return errorResponse(res, 500, error.message || 'Failed to archive resource');
  }
};

module.exports = {
  getResources,
  getResourceById,
  checkAvailability,
  createResource,
  updateResource,
  updateResourceStatus,
  archiveResource,
  uploadImage,
};
