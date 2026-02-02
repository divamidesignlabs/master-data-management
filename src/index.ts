/**
 * Master Data Management Package
 * Main export file for the package
 */
import './pages/MasterView/index.scss';
import './pages/MasterForm/index.scss';
// Rest of your existing exports...
export { createApiService } from './hooks/useApiService';
// API Service
export type { ApiService, ApiEndpoints } from './hooks/useApiService';

// Components
export { default as MasterView } from './pages/MasterView/MasterView';
export type { MasterViewProps } from './pages/MasterView/MasterView';
export { default as MasterForm } from './pages/MasterForm/MasterForm';
export type { MasterFormProps } from './pages/MasterForm/MasterForm';
export { ServerSideGrid } from './components/ServerSideGrid';
export { Pagination } from './components/Pagination';

// Constants
export * from './constants';
