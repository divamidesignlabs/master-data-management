import { useEffect, useMemo, useState, useCallback } from 'react';
import {
    Box,
    Button,
    TextField,
    Autocomplete,
    Typography,
    Paper,
    CircularProgress,
    Alert,
} from '@mui/material';
import './index.scss';
import {
    PAGE_TITLES,
    BUTTON_LABELS,
    ERROR_MESSAGES,
    PLACEHOLDERS,
    REQUIRED_INDICATOR,
    REQUIRED_INDICATOR_COLOR,
    DISPLAY_FIELD_SUFFIX,
} from '../../constants/ui.constants';
import {
    FIELD_TYPES,
    FORM_MODES,
} from '../../constants/form.constants';
import type { FormMode } from '../../constants/form.constants';
import { createApiService, type ApiEndpoints } from '../../hooks/useApiService';
import type { AxiosInstance } from 'axios';

type FormFieldConfig = {
    fieldName: string;
    dataType: string;
    fieldType: string;
    optionType: string | null;
    option: string | any[] | null;
    validation: { max?: number; min?: number; required?: boolean };
};

type FormConfig = Record<string, FormFieldConfig>;

export interface MasterFormProps {
    apiClient: AxiosInstance;
    apiEndpoints: ApiEndpoints;
    entity: string;
    id?: string;
    mode: FormMode;
    onBack?: () => void;
    onSuccess?: (data: any) => void;
}

const MasterForm = ({ 
    apiClient, 
    apiEndpoints, 
    entity, 
    id, 
    mode, 
    onBack,
    onSuccess 
}: MasterFormProps) => {
    const api = useMemo(() => createApiService(apiClient, apiEndpoints), [apiClient, apiEndpoints]);

    const [formConfig, setFormConfig] = useState<FormConfig>({});
    const [values, setValues] = useState<Record<string, any>>({});
    const [loading, setLoading] = useState(false);
    const [dropdownOptions, setDropdownOptions] = useState<Record<string, any[]>>({});
    const [loadingMeta, setLoadingMeta] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fieldNames = useMemo(() => Object.keys(formConfig), [formConfig]);

    const sortedFieldNames = useMemo(() => {
        return fieldNames.sort((a, b) => {
            const aConfig = formConfig[a];
            const bConfig = formConfig[b];
            
            if (aConfig?.validation?.required && !bConfig?.validation?.required) return -1;
            if (!aConfig?.validation?.required && bConfig?.validation?.required) return 1;
            return a.localeCompare(b);
        });
    }, [fieldNames, formConfig]);

    // Load metadata and dropdown options
    useEffect(() => {
        if (!entity) return;

        let isMounted = true;

        const loadMetadata = async () => {
            setLoadingMeta(true);
            setError(null);
            
            try {
                const res = await api.getMetadata(entity);
                if (!isMounted) return;
                
                const md = res.data?.data || res.data || {};
                const config = md.formConfig || {};
                
                setFormConfig(config);

                // Load dropdown options for all dropdown fields
                const opts: Record<string, any[]> = {};
                
                for (const [label, cfg] of Object.entries(config) as [string, FormFieldConfig][]) {
                    if (cfg.fieldType === FIELD_TYPES.DROPDOWN) {
                        if (cfg.optionType === 'API' && cfg.option && typeof cfg.option === 'string') {
                            try {
                                const optionsRes = await api.getDropdownOptions(cfg.option);
                                const rawData = optionsRes.data || [];
                                
                                const options = rawData.map((opt: any) => ({
                                    value: opt.id,
                                    label: opt.name || opt.displayName || String(opt.id)
                                }));
                                
                                opts[cfg.fieldName] = options;
                            } catch (err) {
                                console.error(`Failed to load options for ${label}:`, err);
                                opts[cfg.fieldName] = [];
                            }
                        } else if (cfg.optionType === 'Raw' && Array.isArray(cfg.option)) {
                            opts[cfg.fieldName] = cfg.option;
                        }
                    }
                }

                if (isMounted) {
                    setDropdownOptions(opts);
                }
            } catch (error) {
                console.error(ERROR_MESSAGES.FAILED_LOAD_METADATA, error);
                if (isMounted) {
                    setError(ERROR_MESSAGES.FAILED_LOAD_FORM_CONFIG);
                }
            } finally {
                if (isMounted) {
                    setLoadingMeta(false);
                }
            }
        };

        loadMetadata();

        return () => {
            isMounted = false;
        };
    }, [entity, api, apiClient]);

    // Load existing record for edit/view
    useEffect(() => {
        if (!entity || !id || mode === FORM_MODES.CREATE) {
            setValues({});
            return;
        }

        let isMounted = true;

        const loadRecord = async () => {
            setLoading(true);
            setError(null);
            
            try {
                const res = await api.getRecord(entity, id);
                
                if (!isMounted) return;
                
                const data = res.data?.data || res.data || {};

                // Transform data, excluding display fields
                const transformedData: Record<string, any> = {};
                for (const [key, value] of Object.entries(data)) {
                    if (!key.endsWith(DISPLAY_FIELD_SUFFIX)) {
                        transformedData[key] = value;
                    }
                }

                setValues(transformedData);
            } catch (error) {
                console.error(ERROR_MESSAGES.FAILED_LOAD_RECORD, error);
                if (isMounted) {
                    setError(ERROR_MESSAGES.FAILED_LOAD_RECORD);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        loadRecord();

        return () => {
            isMounted = false;
        };
    }, [entity, id, mode, api]);

    const handleChange = useCallback((key: string, val: any) => {
        setValues((prev) => ({ ...prev, [key]: val }));
    }, []);

    const validateForm = useCallback(() => {
        const errors: string[] = [];
        
        for (const [label, cfg] of Object.entries(formConfig)) {
            if (cfg.validation?.required && !values[cfg.fieldName]) {
                errors.push(ERROR_MESSAGES.FIELD_REQUIRED(label));
            }
            
            if (cfg.validation?.min !== undefined && values[cfg.fieldName] < cfg.validation.min) {
                errors.push(`${label} must be at least ${cfg.validation.min}`);
            }
            
            if (cfg.validation?.max !== undefined && values[cfg.fieldName] > cfg.validation.max) {
                errors.push(`${label} must be at most ${cfg.validation.max}`);
            }
        }
        
        return errors;
    }, [formConfig, values]);

    const handleSubmit = useCallback(async () => {
        if (!entity) return;

        const validationErrors = validateForm();
        if (validationErrors.length > 0) {
            setError(validationErrors.join(', '));
            return;
        }

        setLoading(true);
        setError(null);
        
        try {
            // Build payload only with configured fields
            const payload: Record<string, any> = {};
            for (const cfg of Object.values(formConfig)) {
                const key = cfg.fieldName;
                if (key && values[key] !== undefined && values[key] !== '') {
                    payload[key] = values[key];
                }
            }

            if (mode === FORM_MODES.CREATE) {
                // Wrap in data object as expected by CreateEntityRecordDto
                const result = await api.createRecord(entity, { data: payload });
                onSuccess?.(result);
            } else if (id) {
                // Wrap in data object as expected by UpdateEntityRecordDto
                const result = await api.updateRecord(entity, id, { data: payload });
                onSuccess?.(result);
            }

            onBack?.();
        } catch (error: any) {
            console.error('Failed to save record:', error);
            const errorMessage = error?.response?.data?.message || 
                                (Array.isArray(error?.response?.data?.message) 
                                    ? error.response.data.message.join(', ') 
                                    : 'Failed to save record. Please try again.');
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    }, [entity, formConfig, values, validateForm, mode, id, api, onBack, onSuccess]);

    const renderFormField = useCallback((label: string) => {
        const cfg = formConfig[label];
        const key = cfg?.fieldName;

        if (!cfg || key === 'id') return null;

        const value = values[key] ?? '';
        const isDisabled = mode === FORM_MODES.VIEW || loading;

        return (
            <Box key={label} className="form-field">
                <Typography variant="body2" className="field-label">
                    {label}
                    {cfg.validation?.required && mode !== FORM_MODES.VIEW && (
                        <span style={{ color: REQUIRED_INDICATOR_COLOR }}>{REQUIRED_INDICATOR}</span>
                    )}
                </Typography>

                {cfg.fieldType === FIELD_TYPES.DROPDOWN ? (
                    <Autocomplete
                        options={dropdownOptions[key] || []}
                        getOptionLabel={(option) => option.label || String(option.value)}
                        value={dropdownOptions[key]?.find((opt) => opt.value === value) || null}
                        onChange={(_, val) => handleChange(key, val?.value ?? null)}
                        disabled={isDisabled}
                        loading={loadingMeta}
                        renderInput={(params) => (
                            <TextField 
                                {...params} 
                                size="small" 
                                placeholder={PLACEHOLDERS.SELECT(label)}
                                error={cfg.validation?.required && !value && mode !== FORM_MODES.VIEW}
                            />
                        )}
                        className="field-input"
                    />
                ) : cfg.fieldType === FIELD_TYPES.DATEPICKER ? (
                    <TextField
                        type="date"
                        size="small"
                        value={value ? String(value).slice(0, 10) : ''}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={isDisabled}
                        error={cfg.validation?.required && !value && mode !== FORM_MODES.VIEW}
                        className="field-input"
                        InputLabelProps={{ shrink: true }}
                    />
                ) : cfg.dataType === 'number' || cfg.dataType === 'float' ? (
                    <TextField
                        type="number"
                        size="small"
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={isDisabled}
                        placeholder={label}
                        error={cfg.validation?.required && !value && mode !== FORM_MODES.VIEW}
                        inputProps={{
                            max: cfg.validation?.max,
                            min: cfg.validation?.min,
                            step: cfg.dataType === 'float' ? 0.01 : 1,
                        }}
                        className="field-input"
                    />
                ) : (
                    <TextField
                        size="small"
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                        disabled={isDisabled}
                        placeholder={label}
                        error={cfg.validation?.required && !value && mode !== FORM_MODES.VIEW}
                        inputProps={{
                            maxLength: cfg.validation?.max,
                        }}
                        className="field-input"
                    />
                )}
            </Box>
        );
    }, [formConfig, values, dropdownOptions, handleChange, mode, loading, loadingMeta]);

    if (loadingMeta) {
        return (
            <Box className="loading-container" display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box className="master-form">
            <Paper className="form-section">
                <Typography variant="h5" gutterBottom>
                    {mode === FORM_MODES.CREATE ? PAGE_TITLES.ADD_NEW_RECORD : mode === FORM_MODES.EDIT ? PAGE_TITLES.EDIT_RECORD : PAGE_TITLES.VIEW_RECORD}
                    {entity && ` - ${entity.charAt(0).toUpperCase() + entity.slice(1)}`}
                </Typography>

                {error && (
                    <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading && mode !== FORM_MODES.VIEW && (
                    <Box display="flex" justifyContent="center" my={2}>
                        <CircularProgress size={24} />
                    </Box>
                )}

                 <Box className="form-fields">
                    {sortedFieldNames.map(renderFormField)}
                </Box>

                 <Box className="action-buttons" mt={3}>
                    {mode !== FORM_MODES.VIEW ? (
                        <>
                            <Button 
                                variant="contained" 
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading ? <CircularProgress size={24} /> : mode === FORM_MODES.CREATE ? BUTTON_LABELS.CREATE : BUTTON_LABELS.UPDATE}
                            </Button>
                            <Button 
                                variant="outlined" 
                                onClick={() => onBack?.()}
                                disabled={loading}
                            >
                                {BUTTON_LABELS.CANCEL}
                            </Button>
                        </>
                    ) : (
                        <Button variant="outlined" onClick={() => onBack?.()}>
                            {BUTTON_LABELS.BACK}
                        </Button>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default MasterForm;