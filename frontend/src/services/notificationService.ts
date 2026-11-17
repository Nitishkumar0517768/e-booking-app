import { api } from './api';
import { Booking } from './bookingService';

export interface AppNotification {
  _id: string;
  userId: string;
  bookingId?: Booking;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationService = {
  async getNotifications() {
    return (await api.get('/notifications')) as {
      success: boolean;
      data: {
        notifications: AppNotification[];
        unreadCount: number;
      };
    };
  },

  async markAsRead(id: string) {
    return (await api.patch(`/notifications/${id}/read`)) as {
      success: boolean;
      data: { notification: AppNotification };
    };
  },

  async markAllAsRead() {
    return (await api.patch('/notifications/read-all')) as {
      success: boolean;
    };
  },
};

