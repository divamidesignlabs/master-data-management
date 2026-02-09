import { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import {
    Box,
    Button,
    TextField,
    Autocomplete,
    Typography,
    Paper,
    MenuItem,
    Menu,
} from '@mui/material';
import { ServerSideGrid } from '../../components/ServerSideGrid';
import { Pagination } from '../../components/Pagination';
import { PaginationContainer, ServerSideGridStyledFormControl, StyledSelect, StyledBox } from '../../components/ServerSideGrid/styles';
import './index.scss';
import type { ColDef } from 'ag-grid-community';
import {
    BUTTON_LABELS,
    FIELD_LABELS,
    PLACEHOLDERS,
    EXPORT_OPTIONS,
    FILE_EXTENSIONS,
    ERROR_MESSAGES,
    GRID_TEXT,
    PAGE_SIZE_OPTIONS,
} from '../../constants/ui.constants';
import { SORT_ORDER, MIME_TYPES } from '../../constants/api.constants';
import { DATA_TYPES, DATE_RANGE_SUFFIXES } from '../../constants/form.constants';
import { GRID_TIMEOUTS, ROW_MODEL_TYPES } from '../../constants/grid.constants';
import { createApiService, type ApiEndpoints } from '../../hooks/useApiService';
import type { AxiosInstance } from 'axios';

type EntityItem = { name: string; label: string };
type Parameter = { name: string; label: string; dataType: string; options: any[] | null };
type ResultColumn = { name: string; label: string; dataType: string };

export interface MasterViewProps {
    apiClient: AxiosInstance;
    apiEndpoints: ApiEndpoints;
    onNavigateToNew?: (entity: string) => void;
    onNavigateToView?: (entity: string, id: string | number) => void;
    onNavigateToEdit?: (entity: string, id: string | number) => void;
}

const MasterView = ({
    apiClient,
    apiEndpoints,
    onNavigateToNew,
    onNavigateToEdit
}: MasterViewProps) => {
    const api = useMemo(() => createApiService(apiClient, apiEndpoints), [apiClient, apiEndpoints]);
    const [entities, setEntities] = useState<EntityItem[]>([]);
    const [selectedEntity, setSelectedEntity] = useState<EntityItem | null>(null);
    const [parameters, setParameters] = useState<Parameter[]>([]);
    const [paramValues, setParamValues] = useState<Record<string, any>>({});
    const [resultColumns, setResultColumns] = useState<ResultColumn[]>([]);
    const [rows, setRows] = useState<any[]>([]);
    const [totalRows, setTotalRows] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [view, setView] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState<Record<string, any[]>>({});
    const [sortModel, setSortModel] = useState<{ colId: string; sort: 'asc' | 'desc' }[]>([]);
    const [exportAnchorEl, setExportAnchorEl] = useState<null | HTMLElement>(null);

    const shouldFetchRef = useRef(true);
    const lastFetchTrigger = useRef<{ page: number; pageSize: number; sort: string }>({
        page: 0,
        pageSize: 0,
        sort: ''
    });

    useEffect(() => {
        const loadEntities = async () => {
            try {
                const res = await api.getEntities();
                const entitiesData = res.data || [];
                const mapped: EntityItem[] = entitiesData.map((e: any) => ({
                    name: e.tableName || e.name,
                    label: e.displayName || e.label,
                }));

                setEntities(mapped);
                if (mapped.length > 0) {
                    setSelectedEntity(mapped[0]);
                }
            } catch (error) {
                console.error(ERROR_MESSAGES.FAILED_LOAD_ENTITIES, error);
            }
        };

        loadEntities();
    }, []);

    // Load metadata when entity changes
    useEffect(() => {
        if (!selectedEntity) return;

        const loadMetadata = async () => {
            try {
                const res = await api.getMetadata(selectedEntity.name);
                const md = res.data || {};

                setParameters(md.parameterList || []);
                setResultColumns(md.resultsList || []);

                const defaults: Record<string, any> = {};
                (md.parameterList || []).forEach((p: Parameter) => {
                    defaults[p.name] = null;
                });
                setParamValues(defaults);

                // Load dropdown options
                const opts: Record<string, any[]> = {};
                for (const param of md.parameterList || []) {
                    if (param.options && Array.isArray(param.options)) {
                        opts[param.name] = param.options;
                    }
                }

                setDropdownOptions(opts);

                // Reset view state
                setRows([]);
                setView(false);
            } catch (error) {
                console.error(ERROR_MESSAGES.FAILED_LOAD_METADATA, error);
            }
        };

        loadMetadata();
    }, [selectedEntity]);

    // Function to build query params on-demand (not memoized to prevent auto-triggering)
    // Optional pageOverride allows explicit page value (e.g., when resetting to page 1 on View)
    const buildQueryParams = useCallback((pageOverride?: number) => {
        const filters: Record<string, any> = {};
        const searchFields: string[] = [];
        const searchValues: string[] = [];

        parameters.forEach((p) => {
            // Handle date range separately
            if (p.dataType === DATA_TYPES.DATERANGE) {
                const startValue = paramValues[`${p.name}${DATE_RANGE_SUFFIXES.FROM}`];
                const endValue = paramValues[`${p.name}${DATE_RANGE_SUFFIXES.TO}`];

                if (startValue) {
                    filters[`${p.name}${DATE_RANGE_SUFFIXES.FROM}`] = startValue;
                }
                if (endValue) {
                    filters[`${p.name}${DATE_RANGE_SUFFIXES.TO}`] = endValue;
                }
                return;
            }

            const value = paramValues[p.name];
            if (value === null || value === undefined || value === '') return;

            if (!p.options) {
                searchFields.push(p.name);
                searchValues.push(String(value).trim());
            } else {
                filters[p.name] = value;
            }
        });

        const params: any = {
            page: pageOverride !== undefined ? pageOverride : currentPage,
            limit: pageSize,
        };

        // Serialize filters as filters[key]=value format for backend parsing
        if (Object.keys(filters).length > 0) {
            Object.entries(filters).forEach(([key, value]) => {
                params[`filters[${key}]`] = value;
            });
        }

        if (searchFields.length > 0) {
            params.search = searchValues.join(',');
            params.searchBy = searchFields.join(',');
        }

        if (sortModel.length > 0) {
            params.sortBy = sortModel.map(s => s.colId).join(',');
            params.sortOrder = sortModel.map(s => s.sort === 'desc' ? SORT_ORDER.DESC : SORT_ORDER.ASC).join(',');
        }

        return params;
    }, [parameters, paramValues, currentPage, pageSize, sortModel]);

    // Fetch list - builds params on-demand to avoid auto-triggering
    const fetchList = useCallback(async () => {
        if (!selectedEntity || !shouldFetchRef.current) return;

        shouldFetchRef.current = false;
        setLoading(true);

        try {
            const queryParams = buildQueryParams();
            const res = await api.getRecords(selectedEntity.name, queryParams);

            const records = res.data || [];
            const count = res.total || 0;

            setRows(records);
            setTotalRows(count);
        } catch (error) {
            console.error(ERROR_MESSAGES.FAILED_FETCH_LIST, error);
            console.error('Full error:', error);
            setRows([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
            shouldFetchRef.current = true;
        }
    }, [selectedEntity, api, buildQueryParams]);

    // Only trigger fetch on pagination or sort changes AFTER View is clicked, NOT on filter changes
    useEffect(() => {
        if (!view) return; // Don't fetch if View hasn't been clicked

        // Track if page, pageSize, or sort actually changed
        const sortString = JSON.stringify(sortModel);
        const hasChanged =
            lastFetchTrigger.current.page !== currentPage ||
            lastFetchTrigger.current.pageSize !== pageSize ||
            lastFetchTrigger.current.sort !== sortString;

        // Only fetch if something actually changed (prevents initial trigger)
        if (hasChanged && lastFetchTrigger.current.page !== 0) {
            lastFetchTrigger.current = { page: currentPage, pageSize, sort: sortString };
            shouldFetchRef.current = true;
            fetchList();
        }
    }, [currentPage, pageSize, sortModel, view, fetchList]);

    const handleView = async () => {
        setCurrentPage(1);
        setView(true);
        // Update tracking ref
        lastFetchTrigger.current = {
            page: 1,
            pageSize,
            sort: JSON.stringify(sortModel)
        };

        // Fetch immediately with explicit page=1 (don't wait for state update)
        if (!selectedEntity) return;
        setLoading(true);
        shouldFetchRef.current = false;

        try {
            const queryParams = buildQueryParams(1); // Force page=1 when View is clicked
            const res = await api.getRecords(selectedEntity.name, queryParams);

            const records = res.data || [];
            const count = res.total || 0;

            setRows(records);
            setTotalRows(count);
        } catch (error) {
            console.error(ERROR_MESSAGES.FAILED_FETCH_LIST, error);
            console.error('Full error:', error);
            setRows([]);
            setTotalRows(0);
        } finally {
            setLoading(false);
            shouldFetchRef.current = true;
        }
    };

    const handleExportClick = (event: React.MouseEvent<HTMLElement>) => {
        setExportAnchorEl(event.currentTarget);
    };

    const handleExportClose = () => {
        setExportAnchorEl(null);
    };

    // Generic export function to reduce code duplication
    const handleExport = async (format: 'csv' | 'excel') => {
        if (!selectedEntity) return;

        try {
            // Build export params WITHOUT pagination
            const filters: Record<string, any> = {};
            const searchFields: string[] = [];
            const searchValues: string[] = [];

            parameters.forEach((p) => {
                // Handle date range separately
                if (p.dataType === DATA_TYPES.DATERANGE) {
                    const startValue = paramValues[`${p.name}${DATE_RANGE_SUFFIXES.FROM}`];
                    const endValue = paramValues[`${p.name}${DATE_RANGE_SUFFIXES.TO}`];

                    if (startValue) {
                        filters[`${p.name}${DATE_RANGE_SUFFIXES.FROM}`] = startValue;
                    }
                    if (endValue) {
                        filters[`${p.name}${DATE_RANGE_SUFFIXES.TO}`] = endValue;
                    }
                    return;
                }

                const value = paramValues[p.name];
                if (value === null || value === undefined || value === '') return;

                if (!p.options) {
                    searchFields.push(p.name);
                    searchValues.push(String(value).trim());
                } else {
                    filters[p.name] = value;
                }
            });

            const exportParams: any = {};

            // Serialize filters as filters[key]=value format for backend parsing
            if (Object.keys(filters).length > 0) {
                Object.entries(filters).forEach(([key, value]) => {
                    exportParams[`filters[${key}]`] = value;
                });
            }

            if (searchFields.length > 0) {
                exportParams.search = searchValues.join(',');
                exportParams.searchBy = searchFields.join(',');
            }

            if (sortModel.length > 0) {
                exportParams.sortBy = sortModel.map(s => s.colId).join(',');
                exportParams.sortOrder = sortModel.map(s => s.sort === 'desc' ? SORT_ORDER.DESC : SORT_ORDER.ASC).join(',');
            }


            const response = format === 'csv'
                ? await api.exportCSV(selectedEntity.name, exportParams)
                : await api.exportExcel(selectedEntity.name, exportParams);

            // Improved blob handling
            const contentType = response.headers['content-type'] || (format === 'csv' ? MIME_TYPES.CSV : MIME_TYPES.EXCEL);
            const blob = new Blob([response.data], { type: contentType });

            // Get filename from Content-Disposition header if available
            const contentDisposition = response.headers['content-disposition'];
            let filename = `${selectedEntity.name}_${new Date().toISOString().split('T')[0]}`;

            if (contentDisposition) {
                const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);
                if (filenameMatch && filenameMatch[1]) {
                    filename = filenameMatch[1].replace(/["]/g, '');
                }
            } else {
                // Add extension if not in filename
                const extension = format === 'csv' ? FILE_EXTENSIONS.CSV : FILE_EXTENSIONS.EXCEL;
                if (!filename.endsWith(`.${extension}`)) {
                    filename += `.${extension}`;
                }
            }

            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');

            link.href = url;
            link.download = filename;
            link.style.display = 'none';

            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            setTimeout(() => URL.revokeObjectURL(url), GRID_TIMEOUTS.URL_REVOKE);

        } catch (error) {
            console.error(`Failed to export ${format.toUpperCase()}:`, error);
            // You might want to show a user-friendly error message here
            alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
        } finally {
            handleExportClose();
        }
    };

    // Memoized columns with stable reference
    const columns: ColDef[] = useMemo(() => {
        const cols: ColDef[] = resultColumns.map((c) => ({
            field: c.name,
            headerName: c.label,
            sortable: true,
            filter: false,
            width: 200,
            suppressSizeToFit: true,
            suppressAutoSize: true,
            resizable: true,
        }));

        cols.push({
            field: 'actions',
            headerName: FIELD_LABELS.ACTIONS,
            sortable: false,
            filter: false,
            width: 200,
            minWidth: 200,
            maxWidth: 220,

            suppressSizeToFit: true,
            suppressAutoSize: true,
            resizable: false,
            cellRenderer: (params: any) => {
                const rowData = params.data;
                if (!rowData || !selectedEntity) return null;

                return (
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', height: '100%' }}>
                        <Button
                            size="small"
                            variant="outlined"
                            sx={{
                                width: 180,
                                height: 40,
                                minWidth: 180,
                                fontWeight: 'normal',
                            }}
                            onClick={() => onNavigateToEdit?.(selectedEntity.name, rowData.id)}
                        >
                            {BUTTON_LABELS.EDIT}
                        </Button>
                    </Box>
                );
            },
        });

        return cols;
    }, [resultColumns, selectedEntity, onNavigateToEdit]);

    return (
        <Box className="master-view">
            <Paper className="filter-section">
                <Box className="filters">
                    <Box className="filter-field">
                        <Typography variant="body2" className="field-label">{FIELD_LABELS.SELECT_ENTITY}</Typography>
                        <Autocomplete
                            options={entities}
                            getOptionLabel={(option) => option.label}
                            value={selectedEntity}
                            onChange={(_, val) => setSelectedEntity(val)}
                            renderInput={(params) => <TextField {...params} size="small" placeholder={PLACEHOLDERS.SELECT_ENTITY} />}
                            className="field-input"
                        />
                    </Box>

                    {parameters.filter(p => p.name.toLowerCase() !== 'id').map((param) => (
                        <Box key={param.name} className="filter-field">
                            <Typography variant="body2" className="field-label">{param.label}</Typography>
                            {param.dataType === DATA_TYPES.DATERANGE ? (
                                <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
                                    <TextField
                                        type="date"
                                        size="small"
                                        value={paramValues[`${param.name}${DATE_RANGE_SUFFIXES.FROM}`] || ''}
                                        onChange={(e) => setParamValues((prev) => ({ ...prev, [`${param.name}${DATE_RANGE_SUFFIXES.FROM}`]: e.target.value }))}
                                        sx={{ flex: 1 }}
                                    />
                                    <TextField
                                        type="date"
                                        size="small"
                                        label={FIELD_LABELS.TO}
                                        value={paramValues[`${param.name}${DATE_RANGE_SUFFIXES.TO}`] || ''}
                                        onChange={(e) => setParamValues((prev) => ({ ...prev, [`${param.name}${DATE_RANGE_SUFFIXES.TO}`]: e.target.value }))}
                                        sx={{ flex: 1 }}
                                    />
                                </Box>
                            ) : param.dataType === DATA_TYPES.DATE ? (
                                <TextField
                                    type="date"
                                    size="small"
                                    value={paramValues[param.name] || ''}
                                    onChange={(e) => setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
                                    className="field-input"
                                />
                            ) : param.options ? (
                                <Autocomplete
                                    options={dropdownOptions[param.name] || param.options}
                                    getOptionLabel={(option) => option.label || String(option.value)}
                                    value={dropdownOptions[param.name]?.find((opt: any) => opt.value === paramValues[param.name]) || null}
                                    onChange={(_, val) => setParamValues((prev) => ({ ...prev, [param.name]: val?.value || null }))}
                                    renderInput={(params) => <TextField {...params} size="small" placeholder={PLACEHOLDERS.SELECT(param.label)} />}
                                    className="field-input"
                                />
                            ) : param.dataType === DATA_TYPES.NUMBER ? (
                                <TextField
                                    type="number"
                                    size="small"
                                    value={paramValues[param.name] || ''}
                                    onChange={(e) => setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
                                    placeholder={PLACEHOLDERS.FILTER_BY(param.label)}
                                    className="field-input"
                                />
                            ) : (
                                <TextField
                                    size="small"
                                    value={paramValues[param.name] || ''}
                                    onChange={(e) => setParamValues((prev) => ({ ...prev, [param.name]: e.target.value }))}
                                    placeholder={PLACEHOLDERS.FILTER_BY(param.label)}
                                    className="field-input"
                                />
                            )}
                        </Box>
                    ))}
                </Box>

                <Box className="action-buttons">
                    <Button
                        variant="contained"
                        className="primary-btn"
                        onClick={handleView}
                        sx={{
                            width: 180,
                            height: 40,
                            minWidth: 180,
                        }}
                    >
                        {BUTTON_LABELS.VIEW}
                    </Button>

                    <Button
                        variant="contained"
                        className="primary-btn"
                        disabled={!selectedEntity}
                        sx={{
                            width: 180,
                            height: 40,
                            minWidth: 180,
                        }}
                        onClick={() => selectedEntity && onNavigateToNew?.(selectedEntity.name)}
                    >
                        {BUTTON_LABELS.ADD_NEW_RECORD}
                    </Button>
                </Box>

            </Paper>

            {view && (
                <Paper className="grid-section" sx={{ mt: 4 }}>
                    <Box display="flex" justifyContent="flex-end" mb={2}>
                        <Button
                            variant="outlined"
                            className="secondary-btn"
                            onClick={handleExportClick}
                            sx={{
                                width: 180,
                                height: 40,
                                minWidth: 180,
                            }}
                        >
                            {BUTTON_LABELS.EXPORT}
                        </Button>
                        <Menu
                            anchorEl={exportAnchorEl}
                            open={Boolean(exportAnchorEl)}
                            onClose={handleExportClose}
                        >
                            <MenuItem onClick={() => handleExport('csv')}>{EXPORT_OPTIONS.CSV}</MenuItem>
                            <MenuItem onClick={() => handleExport('excel')}>{EXPORT_OPTIONS.EXCEL}</MenuItem>
                        </Menu>
                    </Box>
                    <ServerSideGrid
                        key={selectedEntity?.name}
                        rows={rows}
                        columns={columns}
                        totalRecords={totalRows}
                        currentPage={currentPage}
                        loading={loading}
                        rowModelType={ROW_MODEL_TYPES.CLIENT_SIDE}
                        onPageChange={setCurrentPage}
                        pageSize={pageSize}
                        pageSizeOptions={[...PAGE_SIZE_OPTIONS]}
                        onPageSizeChange={(size) => {
                            setPageSize(size);
                            setCurrentPage(1);
                        }}
                        setSort={setSortModel}
                        sortModel={sortModel}
                        height={500}
                    />
                    <PaginationContainer>
                        <Box display="flex" alignItems="center" gap={1}>
                            <ServerSideGridStyledFormControl variant="outlined" size="small">
                                <StyledBox>{GRID_TEXT.SHOWING} </StyledBox>
                                <StyledSelect
                                    value={pageSize}
                                    inputProps={{ "aria-label": "Page size" }}
                                    onChange={(e) => {
                                        setPageSize(Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                >
                                    {PAGE_SIZE_OPTIONS.map(size => (
                                        <MenuItem key={size} value={size}>{size}</MenuItem>
                                    ))}
                                </StyledSelect>
                                <StyledBox>{GRID_TEXT.OF} {totalRows} {GRID_TEXT.ENTRIES}</StyledBox>
                            </ServerSideGridStyledFormControl>
                        </Box>
                        <Pagination
                            totalRecords={totalRows}
                            currentPage={currentPage}
                            onPageChange={setCurrentPage}
                            pageSize={pageSize}
                        />
                    </PaginationContainer>
                </Paper>
            )}
        </Box>
    );
};

export default MasterView;