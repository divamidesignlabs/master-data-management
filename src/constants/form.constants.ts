/**
 * Form Constants
 * Central location for all form-related constants including field types, data types, and validation
 */

// Form Modes
export const FORM_MODES = {
  CREATE: 'create',
  EDIT: 'edit',
  VIEW: 'view',
} as const;

export type FormMode = typeof FORM_MODES[keyof typeof FORM_MODES];

// Field Types
export const FIELD_TYPES = {
  TEXT: 'text',
  DROPDOWN: 'dropdown',
  DATEPICKER: 'datepicker',
  NUMBER: 'number',
  TEXTAREA: 'textarea',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
} as const;

// Data Types
export const DATA_TYPES = {
  STRING: 'string',
  NUMBER: 'number',
  FLOAT: 'float',
  DATE: 'date',
  DATERANGE: 'daterange',
  BOOLEAN: 'boolean',
  ARRAY: 'array',
  OBJECT: 'object',
} as const;

// Option Types
export const OPTION_TYPES = {
  API: 'API',
  RAW: 'Raw',
  STATIC: 'Static',
} as const;

// Field Names (Common)
export const FIELD_NAMES = {
  ID: 'id',
  NAME: 'name',
  LABEL: 'label',
  VALUE: 'value',
  DISPLAY_NAME: 'displayName',
  TABLE_NAME: 'tableName',
} as const;

// Validation Rules
export const VALIDATION_RULES = {
  REQUIRED: 'required',
  MIN: 'min',
  MAX: 'max',
  MIN_LENGTH: 'minLength',
  MAX_LENGTH: 'maxLength',
  PATTERN: 'pattern',
  EMAIL: 'email',
  URL: 'url',
} as const;

// Date Range Suffixes
export const DATE_RANGE_SUFFIXES = {
  FROM: 'From',
  TO: 'To',
} as const;

// Input Types
export const INPUT_TYPES = {
  TEXT: 'text',
  NUMBER: 'number',
  DATE: 'date',
  EMAIL: 'email',
  PASSWORD: 'password',
  TEL: 'tel',
  URL: 'url',
} as const;

// Number Input Properties
export const NUMBER_INPUT = {
  FLOAT_STEP: 0.01,
  INTEGER_STEP: 1,
} as const;

// Regex Patterns
export const REGEX_PATTERNS = {
  ENTITY_MATCH: /\/master\/([^\/]+)\/options/,
} as const;
