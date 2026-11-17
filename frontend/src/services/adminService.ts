import { api } from './api';
import { Booking } from './bookingService';

export interface DashboardStatistics {
  totalResources: number;
  activeResources: number;
  maintenanceResources: number;
  totalBookings: number;
  pendingRequests: number;
  approvedBookings: number;
  issuedEquipment: number;
  overdueEquipment: number;
  totalStudents: number;
}

export const adminService = {
  async getDashboardSummary() {
    return (await api.get('/admin/dashboard-summary')) as {
      success: boolean;
      data: {
        statistics: DashboardStatistics;
        recentActivity: Booking[];
      };
    };
  },
};

