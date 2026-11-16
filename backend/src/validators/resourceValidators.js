const { z } = require('zod');

const createResourceSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  category: z.enum([
    'Electronics',
    'Laboratory Equipment',
    'Sports Equipment',
    'Rooms and Facilities',
    'Other Resources',
  ]),
  resourceType: z.enum(['equipment', 'room', 'facility']).default('equipment'),
  imageUrl: z.string().url('Image must be a valid URL').optional(),
  department: z.string().min(1, 'Department is required'),
  location: z.string().min(1, 'Location is required'),
  totalQuantity: z.number().int().min(1, 'Total quantity must be at least 1').default(1),
  condition: z.enum(['New', 'Good', 'Fair', 'Maintenance Required']).default('Good'),
  operationalStatus: z.enum(['available', 'maintenance', 'inactive']).default('available'),
  requiresIssueReturn: z.boolean().default(true),
});

const updateResourceSchema = createResourceSchema.partial();

const updateStatusSchema = z.object({
  operationalStatus: z.enum(['available', 'maintenance', 'inactive']),
});

module.exports = {
  createResourceSchema,
  updateResourceSchema,
  updateStatusSchema,
};

