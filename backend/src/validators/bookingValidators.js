const { z } = require('zod');

const createBookingSchema = z.object({
  resourceId: z.string().min(1, 'Resource ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
  startAt: z.string().datetime({ message: 'Valid start date/time ISO string is required' }),
  endAt: z.string().datetime({ message: 'Valid end date/time ISO string is required' }),
  purpose: z.string().min(5, 'Purpose must be at least 5 characters').max(300),
}).refine((data) => new Date(data.endAt) > new Date(data.startAt), {
  message: 'End date and time must be later than start date and time',
  path: ['endAt'],
});

const decisionSchema = z.object({
  action: z.enum(['approve', 'reject']),
  remarks: z.string().optional(),
  rejectionReason: z.string().optional(),
}).refine((data) => {
  if (data.action === 'reject') {
    return !!data.rejectionReason && data.rejectionReason.trim().length > 0;
  }
  return true;
}, {
  message: 'A rejection reason is required when rejecting a booking request',
  path: ['rejectionReason'],
});

const cancelBookingSchema = z.object({
  reason: z.string().optional(),
});

module.exports = {
  createBookingSchema,
  decisionSchema,
  cancelBookingSchema,
};

