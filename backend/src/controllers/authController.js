const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/response');

const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET || 'ebooking_super_secure_jwt_secret_key_2026_x!',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

const register = async (req, res) => {
  try {
    const { name, email, password, studentId, department, phone } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return errorResponse(res, 409, 'An account with this email already exists');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user - ALWAYS force role to 'student'
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      studentId,
      department: department || 'General',
      phone: phone || '',
      role: 'student',
      isActive: true,
    });

    const token = generateToken(newUser._id, newUser.role);

    return successResponse(res, 201, 'Student account registered successfully', {
      user: newUser,
      token,
    });
  } catch (error) {
    console.error('[Register Error]:', error);
    return errorResponse(res, 500, error.message || 'Registration failed');
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const identifier = (email || '').trim();

    if (!identifier || !password) {
      return errorResponse(res, 400, 'Please provide an Email or Student ID and password');
    }

    // Escape any regex special characters in the identifier
    const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Search by email (case-insensitive) OR studentId (case-insensitive)
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase() },
        { studentId: { $regex: new RegExp(`^${escaped}$`, 'i') } },
      ],
    });

    if (!user) {
      return errorResponse(res, 401, 'Invalid email/Student ID or password');
    }

    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is deactivated. Please contact an administrator.');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return errorResponse(res, 401, 'Invalid email/Student ID or password');
    }

    const token = generateToken(user._id, user.role);

    return successResponse(res, 200, 'Login successful', {
      user,
      token,
    });
  } catch (error) {
    console.error('[Login Error]:', error);
    return errorResponse(res, 500, error.message || 'Login failed');
  }
};

const getMe = async (req, res) => {
  try {
    return successResponse(res, 200, 'User profile retrieved', {
      user: req.user,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to retrieve profile');
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, department, phone } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (department) user.department = department;
    if (phone !== undefined) user.phone = phone;

    await user.save();

    return successResponse(res, 200, 'Profile updated successfully', {
      user,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message || 'Failed to update profile');
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateProfile,
};

