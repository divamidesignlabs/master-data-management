/**
 * API Constants
 * Central location for all API-related constants including endpoints, HTTP methods, and headers
 */

// API Configuration
export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:3000',
  TIMEOUT: 30000,
  HEADERS: {
    CONTENT_TYPE: 'application/json',
  },
} as const;

// Base API Paths
export const API_BASE_PATHS = {
  MASTER: '/master',
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Entity endpoints
  ENTITIES: '/master/entities',
  ENTITY_METADATA: (entity: string) => `/master/${entity}/metadata`,
  ENTITY_RECORDS: (entity: string) => `/master/${entity}/records`,
  ENTITY_RECORD_BY_ID: (entity: string, id: string | number) => `/master/${entity}/records/${id}`,
  ENTITY_OPTIONS: (entity: string) => `/master/${entity}/options`,
  
  // Export endpoints
  EXPORT_CSV: (entity: string) => `/master/${entity}/export/csv`,
  EXPORT_EXCEL: (entity: string) => `/master/${entity}/export/excel`,
} as const;

// HTTP Methods
export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
} as const;

// Query Parameter Keys
export const QUERY_PARAMS = {
  PAGE: 'page',
  LIMIT: 'limit',
  SEARCH: 'search',
  SEARCH_BY: 'searchBy',
  SORT_BY: 'sortBy',
  SORT_ORDER: 'sortOrder',
} as const;

// Sort Order Values
export const SORT_ORDER = {
  ASC: 'ASC',
  DESC: 'DESC',
} as const;

// Response Types
export const RESPONSE_TYPES = {
  JSON: 'json',
  BLOB: 'blob',
  TEXT: 'text',
} as const;

// MIME Types
export const MIME_TYPES = {
  CSV: 'text/csv;charset=utf-8;',
  EXCEL: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  JSON: 'application/json',
} as const;

// API Response Keys
export const RESPONSE_KEYS = {
  DATA: 'data',
  COUNT: 'count',
  MESSAGE: 'message',
  ERROR: 'error',
} as const;
