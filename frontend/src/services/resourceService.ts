import { api } from './api';

export interface Resource {
  _id: string;
  name: string;
  description: string;
  category: 'Electronics' | 'Laboratory Equipment' | 'Sports Equipment' | 'Rooms and Facilities' | 'Other Resources';
  resourceType: 'equipment' | 'room' | 'facility';
  imageUrl: string;
  department: string;
  location: string;
  totalQuantity: number;
  availableQuantity?: number;
  condition: 'New' | 'Good' | 'Fair' | 'Maintenance Required';
  operationalStatus: 'available' | 'maintenance' | 'inactive';
  requiresIssueReturn: boolean;
  bookingVersion: number;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AvailabilityResult {
  resourceId: string;
  name: string;
  totalQuantity: number;
  availableQuantity: number;
  maxReserved: number;
  overlappingCount: number;
  isBookable: boolean;
}

export const resourceService = {
  async getResources(params?: { category?: string; search?: string; status?: string; page?: number; limit?: number }) {
    return (await api.get('/resources', { params })) as {
      success: boolean;
      data: {
        resources: Resource[];
        pagination: { page: number; limit: number; total: number; pages: number };
      };
    };
  },

  async getResourceById(id: string) {
    return (await api.get(`/resources/${id}`)) as {
      success: boolean;
      data: {
        resource: Resource;
        currentAvailable: number;
        currentReserved: number;
      };
    };
  },

  async checkAvailability(id: string, startAt: string, endAt: string) {
    return (await api.get(`/resources/${id}/availability`, {
      params: { startAt, endAt },
    })) as {
      success: boolean;
      data: AvailabilityResult;
    };
  },

  async createResource(data: Partial<Resource>) {
    return (await api.post('/resources', data)) as {
      success: boolean;
      data: { resource: Resource };
    };
  },

  async updateResource(id: string, data: Partial<Resource>) {
    return (await api.patch(`/resources/${id}`, data)) as {
      success: boolean;
      data: { resource: Resource };
    };
  },

  async updateResourceStatus(id: string, operationalStatus: 'available' | 'maintenance' | 'inactive') {
    return (await api.patch(`/resources/${id}/status`, { operationalStatus })) as {
      success: boolean;
      data: { resource: Resource };
    };
  },

  async archiveResource(id: string) {
    return (await api.delete(`/resources/${id}`)) as {
      success: boolean;
      data: { resource: Resource };
    };
  },

  async uploadImage(base64Image: string) {
    return (await api.post('/resources/upload-image', { image: base64Image })) as {
      success: boolean;
      data: { imageUrl: string };
    };
  },
};

