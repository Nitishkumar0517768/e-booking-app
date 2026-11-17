import { api } from './api';
import { Resource } from './resourceService';
import { User } from './authService';

export interface Booking {
  _id: string;
  bookingCode: string;
  userId: User;
  resourceId: Resource;
  quantity: number;
  startAt: string;
  endAt: string;
  purpose: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled' | 'Issued' | 'Returned';
  adminRemarks?: string;
  rejectionReason?: string;
  approvedBy?: User;
  issuedBy?: User;
  issuedAt?: string;
  returnedAt?: string;
  returnCondition?: 'Good' | 'Fair' | 'Damaged' | 'Missing Parts' | 'Acceptable';
  isOverdue?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const bookingService = {
  async createBooking(data: {
    resourceId: string;
    quantity: number;
    startAt: string;
    endAt: string;
    purpose: string;
  }) {
    return (await api.post('/bookings', data)) as {
      success: boolean;
      data: { booking: Booking };
    };
  },

  async getMyBookings(params?: { status?: string; page?: number; limit?: number }) {
    return (await api.get('/bookings/my', { params })) as {
      success: boolean;
      data: {
        bookings: Booking[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    };
  },

  async getAllBookings(params?: { status?: string; search?: string; page?: number; limit?: number }) {
    return (await api.get('/bookings', { params })) as {
      success: boolean;
      data: {
        bookings: Booking[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    };
  },

  async getBookingById(id: string) {
    return (await api.get(`/bookings/${id}`)) as {
      success: boolean;
      data: { booking: Booking };
    };
  },

  async cancelBooking(id: string) {
    return (await api.patch(`/bookings/${id}/cancel`)) as {
      success: boolean;
      data: { booking: Booking };
    };
  },

  async decisionBooking(id: string, data: { action: 'approve' | 'reject'; remarks?: string; rejectionReason?: string }) {
    return (await api.patch(`/bookings/${id}/decision`, data)) as {
      success: boolean;
      data: { booking: Booking };
    };
  },

  async issueEquipment(id: string, data?: { remarks?: string }) {
    return (await api.patch(`/bookings/${id}/issue`, data || {})) as {
      success: boolean;
      data: { booking: Booking };
    };
  },

  async returnEquipment(id: string, data?: { remarks?: string; condition?: string }) {
    return (await api.patch(`/bookings/${id}/return`, data || {})) as {
      success: boolean;
      data: { booking: Booking };
    };
  },
};

