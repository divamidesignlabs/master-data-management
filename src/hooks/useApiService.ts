/**
 * API Service Hook
 * Provides API operations with configurable axios instance and endpoints
 */

import type { AxiosInstance } from 'axios';

export interface ApiEndpoints {
  entities: string;
  metadata: (entity: string) => string;
  records: (entity: string) => string;
  recordById: (entity: string, id: string | number) => string;
  exportCSV: (entity: string) => string;
  exportExcel: (entity: string) => string;
  dropdownOptions?: (url: string) => string; // Optional: transform relative URL to absolute
}

export interface ApiService {
  getEntities: () => Promise<any>;
  getMetadata: (entity: string) => Promise<any>;
  getRecords: (entity: string, params?: any) => Promise<any>;
  getRecord: (entity: string, id: string | number) => Promise<any>;
  createRecord: (entity: string, data: any) => Promise<any>;
  updateRecord: (entity: string, id: string | number, data: any) => Promise<any>;
  deleteRecord: (entity: string, id: string | number) => Promise<any>;
  exportCSV: (entity: string, params?: any) => Promise<any>;
  exportExcel: (entity: string, params?: any) => Promise<any>;
  getDropdownOptions: (url: string) => Promise<any>;
}

export const createApiService = (
  apiClient: AxiosInstance,
  endpoints: ApiEndpoints
): ApiService => {
  return {
    getEntities: async () => {
      const res = await apiClient.get(endpoints.entities);
      return {
        data: res.data.data ?? res.data,
      };
    },

    getMetadata: async (entity: string) => {
      const res = await apiClient.get(endpoints.metadata(entity));
      return {
        data: res.data.data ?? res.data,
      };
    },

    getRecords: async (entity: string, params?: any) => {
      const res = await apiClient.get(endpoints.records(entity), { params });
      return {
        data: res.data.data ?? res.data,
        total: res.data.total ?? res.data.count ?? 0,
      };
    },

    getRecord: async (entity: string, id: string | number) => {
      const res = await apiClient.get(endpoints.recordById(entity, id));
      return {
        data: res.data.data ?? res.data,
      };
    },

    createRecord: async (entity: string, data: any) => {
      const res = await apiClient.post(endpoints.records(entity), data);
      return {
        data: res.data.data ?? res.data,
      };
    },

    updateRecord: async (entity: string, id: string | number, data: any) => {
      const res = await apiClient.put(endpoints.recordById(entity, id), data);
      return {
        data: res.data.data ?? res.data,
      };
    },

    deleteRecord: async (entity: string, id: string | number) => {
      const res = await apiClient.delete(endpoints.recordById(entity, id));
      return {
        data: res.data.data ?? res.data,
      };
    },

    exportCSV: async (entity: string, params?: any) => {
      const res = await apiClient.get(endpoints.exportCSV(entity), {
        params,
        responseType: 'blob',
      });
      return res;
    },

    exportExcel: async (entity: string, params?: any) => {
      const res = await apiClient.get(endpoints.exportExcel(entity), {
        params,
        responseType: 'blob',
      });
      return res;
    },

    getDropdownOptions: async (url: string) => {
      // Use the endpoint transformer if provided, otherwise use the URL as-is
      const finalUrl = endpoints.dropdownOptions ? endpoints.dropdownOptions(url) : url;
      const res = await apiClient.get(finalUrl);
      return {
        data: res.data.data ?? res.data,
      };
    },
  };
};
