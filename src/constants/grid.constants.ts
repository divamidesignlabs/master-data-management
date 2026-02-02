/**
 * Grid Constants
 * Central location for all grid/table-related constants
 */

// Grid Display Settings
export const GRID_SETTINGS = {
  DEFAULT_HEIGHT: 500,
  MIN_HEIGHT: 300,
  MAX_HEIGHT: 800,
  DEFAULT_ROW_HEIGHT: 50,
} as const;

// Pagination Settings
export const PAGINATION_SETTINGS = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MIN_PAGE: 1,
} as const;

// Sort Settings
export const SORT_SETTINGS = {
  ASC: 'asc',
  DESC: 'desc',
} as const;

export type SortOrder = typeof SORT_SETTINGS[keyof typeof SORT_SETTINGS];

// Grid Event Sources
export const GRID_EVENT_SOURCES = {
  UI_COLUMN_SORTED: 'uiColumnSorted',
  API: 'api',
  COLUMN_MOVED: 'columnMoved',
} as const;

// Grid Layout Types
export const GRID_LAYOUT = {
  NORMAL: 'normal' as const,
  AUTO_HEIGHT: 'autoHeight' as const,
} as const;

// Row Model Types
export const ROW_MODEL_TYPES = {
  CLIENT_SIDE: 'clientSide',
  SERVER_SIDE: 'serverSide',
  INFINITE: 'infinite',
  VIEWPORT: 'viewport',
} as const;

// Column Properties
export const COLUMN_PROPERTIES = {
  DEFAULT_FLEX: 1,
  ACTION_COLUMN_WIDTH: 150,
  SORTABLE: true,
  FILTER: false,
} as const;

// Grid Messages
export const GRID_MESSAGES = {
  NO_DATA: 'N/A',
  LOADING: 'Loading...',
  NO_RECORDS: 'No records found',
} as const;

// Grid CSS Classes
export const GRID_CSS_CLASSES = {
  AG_THEME_ALPINE: 'ag-theme-alpine',
  AG_THEME_BALHAM: 'ag-theme-balham',
  AG_THEME_MATERIAL: 'ag-theme-material',
} as const;

// Timeout Settings
export const GRID_TIMEOUTS = {
  URL_REVOKE: 100, // milliseconds to wait before revoking blob URL
} as const;
