const { z } = require('zod');

const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().toLowerCase().email('Please provide a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  studentId: z.string().trim().min(1, 'Student ID / Enrollment Number is required'),
  department: z.string().trim().min(1, 'Department is required'),
  phone: z.string().trim().optional(),
});

const loginSchema = z.object({
  email: z.string().trim().min(1, 'Please provide your Email or Student ID'),
  password: z.string().min(1, 'Password is required'),
});

const updateProfileSchema = z.object({
  name: z.string().trim().min(2).max(100).optional(),
  department: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

module.exports = {
  registerSchema,
  loginSchema,
  updateProfileSchema,
};
