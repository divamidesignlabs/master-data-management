/**
 * Routes Constants
 * Central location for all application routes and navigation paths
 */

// Base Routes
export const ROUTES = {
  ROOT: '/',
  MASTER: '/master',
  MASTER_ENTITY_NEW: (entity: string) => `/master/${entity}/new`,
  MASTER_ENTITY_VIEW: (entity: string, id: string | number) => `/master/${entity}/${id}`,
  MASTER_ENTITY_EDIT: (entity: string, id: string | number) => `/master/${entity}/${id}/edit`,
} as const;

// Route Patterns (for React Router)
export const ROUTE_PATTERNS = {
  ROOT: '/',
  MASTER: '/master',
  MASTER_ENTITY_NEW: '/master/:entity/new',
  MASTER_ENTITY_VIEW: '/master/:entity/:id',
  MASTER_ENTITY_EDIT: '/master/:entity/:id/edit',
} as const;

// Route Keys for React Router
export const ROUTE_KEYS = {
  NEW: 'new',
  EDIT: 'edit',
  VIEW: 'view',
} as const;

// URL Parameter Names
export const URL_PARAMS = {
  ENTITY: 'entity',
  ID: 'id',
} as const;

// Route Suffixes
export const ROUTE_SUFFIXES = {
  NEW: '/new',
  EDIT: '/edit',
} as const;
