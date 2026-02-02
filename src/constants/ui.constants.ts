/**
 * UI Constants
 * Central location for all UI-related constants including labels, messages, and styling values
 */

// Page Titles
export const PAGE_TITLES = {
  MASTER_DATA_MANAGEMENT: 'Master Data Management',
  ADD_NEW_RECORD: 'Add New Record',
  EDIT_RECORD: 'Edit Record',
  VIEW_RECORD: 'View Record',
} as const;

// Button Labels
export const BUTTON_LABELS = {
  VIEW: 'View',
  ADD_NEW_RECORD: 'Add New Record',
  EDIT: 'Edit',
  CREATE: 'Create',
  UPDATE: 'Update',
  CANCEL: 'Cancel',
  BACK: 'Back',
  EXPORT: 'Export',
} as const;

// Field Labels
export const FIELD_LABELS = {
  SELECT_ENTITY: 'Select Entity',
  ACTIONS: 'Actions',
  FROM: 'From',
  TO: 'To',
} as const;

// Placeholder Text
export const PLACEHOLDERS = {
  SELECT_ENTITY: 'Select Entity',
  SELECT: (label: string) => `Select ${label}`,
  FILTER_BY: (label: string) => `Filter by ${label}`,
} as const;

// Export Options
export const EXPORT_OPTIONS = {
  CSV: 'CSV Format',
  EXCEL: 'Excel Format',
} as const;

// Export File Extensions
export const FILE_EXTENSIONS = {
  CSV: 'csv',
  EXCEL: 'xlsx',
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  FAILED_LOAD_ENTITIES: 'Failed to load entities',
  FAILED_LOAD_METADATA: 'Failed to load metadata',
  FAILED_LOAD_RECORD: 'Failed to load record',
  FAILED_FETCH_LIST: 'Failed to fetch list',
  FAILED_SAVE_RECORD: 'Failed to save record. Please try again.',
  FAILED_EXPORT_CSV: 'Failed to export CSV',
  FAILED_EXPORT_EXCEL: 'Failed to export Excel',
  FAILED_LOAD_OPTIONS: (label: string) => `Failed to load options for ${label}`,
  FAILED_LOAD_FORM_CONFIG: 'Failed to load form configuration',
  FIELD_REQUIRED: (label: string) => `${label} is required`,
  FIELD_MIN_VALUE: (label: string, min: number) => `${label} must be at least ${min}`,
  FIELD_MAX_VALUE: (label: string, max: number) => `${label} must be at most ${max}`,
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  RECORD_CREATED: 'Record created successfully',
  RECORD_UPDATED: 'Record updated successfully',
  RECORD_DELETED: 'Record deleted successfully',
} as const;

// Validation Messages
export const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_FORMAT: 'Invalid format',
} as const;

// Empty State Messages
export const EMPTY_STATE_MESSAGES = {
  NO_DATA_AVAILABLE: 'N/A',
  NO_RECORDS_FOUND: 'No records found',
} as const;

// Loading Messages
export const LOADING_MESSAGES = {
  LOADING: 'Loading...',
  PLEASE_WAIT: 'Please wait...',
} as const;

// Grid Display Text
export const GRID_TEXT = {
  SHOWING: 'Showing',
  OF: 'of',
  ENTRIES: 'entries',
} as const;

// CSS Class Names
export const CSS_CLASSES = {
  MASTER_VIEW: 'master-view',
  MASTER_FORM: 'master-form',
  FILTER_SECTION: 'filter-section',
  FORM_SECTION: 'form-section',
  FILTERS: 'filters',
  FILTER_FIELD: 'filter-field',
  FORM_FIELD: 'form-field',
  FIELD_LABEL: 'field-label',
  FIELD_INPUT: 'field-input',
  ACTION_BUTTONS: 'action-buttons',
  FORM_FIELDS: 'form-fields',
  LOADING_CONTAINER: 'loading-container',
} as const;

// Styling Constants
export const STYLE_CONSTANTS = {
  DEFAULT_TABLE_HEIGHT: 500,
  DEFAULT_PAGE_SIZE: 10,
  DEFAULT_COLUMN_WIDTH: 150,
  MIN_HEIGHT_LOADING: '400px',
  ACTION_BUTTON_GAP: 1,
  FORM_MARGIN_TOP: 3,
  FORM_MARGIN_BOTTOM: 2,
} as const;

// Page Size Options
export const PAGE_SIZE_OPTIONS = [10, 20, 50, 100] as const;

// Required Field Indicator
export const REQUIRED_INDICATOR = ' *';
export const REQUIRED_INDICATOR_COLOR = 'red';

// Display Suffix
export const DISPLAY_FIELD_SUFFIX = '_display';

// Date Format
export const DATE_FORMATS = {
  ISO_DATE: 'YYYY-MM-DD',
  DISPLAY_DATE: 'DD/MM/YYYY',
  FILE_DATE: 'YYYY-MM-DD',
} as const;

// Aria Labels
export const ARIA_LABELS = {
  PAGE_SIZE: 'Page size',
} as const;
