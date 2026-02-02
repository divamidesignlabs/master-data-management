import { AgGridReact } from "ag-grid-react";
import type { AgGridReactProps } from "ag-grid-react";
import { AgGridReact as AgGridReactType } from "ag-grid-react";
import { CircularProgress, Divider } from "@mui/material";
// FIX 1: Use legacy theme mode to fix theming error
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-alpine.css";
import {
    AllCommunityModule,
    ClientSideRowModelModule,
    ModuleRegistry,
} from "ag-grid-community";
import type { ColDef, SortChangedEvent } from "ag-grid-community";
import { GridContainer, StyledAgGridWrapper, Wrapper } from "./styles";
import { useRef } from "react";
import {
    GRID_SETTINGS,
    GRID_EVENT_SOURCES,
    GRID_LAYOUT,
    GRID_MESSAGES,
    ROW_MODEL_TYPES,
    GRID_CSS_CLASSES,
    SORT_SETTINGS,
} from "../../constants/grid.constants";

// Register only the required module
ModuleRegistry.registerModules([ClientSideRowModelModule, AllCommunityModule]);

interface ServerSideGridProps<T extends object> extends AgGridReactProps<T> {
    totalRecords: number;
    currentPage: number;
    loading: boolean;
    onPageChange: (page: number) => void;
    pageSize: number;
    rows: T[];
    columns: ColDef<T>[];
    height?: number;
    pageSizeOptions: number[];
    onPageSizeChange: (pageSize: number) => void;
    setSort?: React.Dispatch<
        React.SetStateAction<{ colId: string; sort: typeof SORT_SETTINGS[keyof typeof SORT_SETTINGS] }[]>
    >;
    sortModel?: { colId: string; sort: typeof SORT_SETTINGS[keyof typeof SORT_SETTINGS] }[];
    getRowHeight?: (params: any) => number;
    domLayout?: "normal" | "autoHeight";
    pinnedBottomRowData?: T[];
    showLoader?: boolean;
    emptyDataMessage?: string;
}

const ServerSideGrid = <T extends object>({
    rows,
    totalRecords,
    currentPage,
    loading,
    onPageChange,
    columns,
    pageSize,
    pageSizeOptions,
    onPageSizeChange,
    setSort,
    sortModel,
    height = GRID_SETTINGS.DEFAULT_HEIGHT,
    domLayout = GRID_LAYOUT.NORMAL,
    getRowHeight,
    pinnedBottomRowData,
    showLoader = true,
    emptyDataMessage,
    ...rest
}: ServerSideGridProps<T>) => {
    const gridRef = useRef<AgGridReactType<T>>(null);
    const lastSortModel = useRef<{ colId: string; sort: typeof SORT_SETTINGS[keyof typeof SORT_SETTINGS] }[]>([]);

    const handleSortChanged = (event: SortChangedEvent) => {
        // Only handle user-initiated sort changes
        if (event.source !== GRID_EVENT_SOURCES.UI_COLUMN_SORTED) {
            return;
        }

        console.log('Sort Changed Event (User Initiated):', event);
        if (!setSort) return;

        const newSortModel = event.api
            .getColumnState()
            .filter(col => col.sort)
            .map(col => ({
                colId: col.colId!,
                sort: col.sort as typeof SORT_SETTINGS[keyof typeof SORT_SETTINGS],
            }));

        console.log('New Sort Model:', newSortModel);
        
        // Check if sort actually changed to prevent duplicate calls
        const sortChanged = JSON.stringify(newSortModel) !== JSON.stringify(lastSortModel.current);
        
        if (sortChanged) {
            lastSortModel.current = newSortModel;
            setSort(newSortModel);
        }
    };

    if (showLoader && loading) {
        return (
            <GridContainer
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    height,
                    minHeight: 120,
                }}
            >
                <CircularProgress />
            </GridContainer>
        );
    }

    return (
        <GridContainer data-testid="ServerSideGrid" className={GRID_CSS_CLASSES.AG_THEME_ALPINE}>
            <Wrapper>
                <StyledAgGridWrapper
                    height={domLayout === GRID_LAYOUT.AUTO_HEIGHT ? undefined : height}
                >
                    <AgGridReact<T>
                        ref={gridRef}
                        // FIX 2: Add theme="legacy" to use v32 style themes
                        theme="legacy"
                        columnDefs={columns}
                        rowData={rows}
                        pinnedBottomRowData={pinnedBottomRowData}
                        domLayout={domLayout}
                        rowModelType={ROW_MODEL_TYPES.CLIENT_SIDE}
                        modules={[ClientSideRowModelModule]}
                        localeText={{
                            noRowsToShow: emptyDataMessage || "No data to show",
                        }}
                        {...rest}
                        enableBrowserTooltips={true}
                        suppressMovableColumns={true}
                        suppressMenuHide={true}
                        onSortChanged={handleSortChanged}
                        suppressAutoSize={true}
                        suppressColumnMoveAnimation={true}

                        defaultColDef={{
                            width: 170,
                            sortable: true,
                            unSortIcon: true,
                            tooltipValueGetter: (params) =>
                                params.value ?? GRID_MESSAGES.NO_DATA,
                            suppressSizeToFit: true,
                            suppressAutoSize: true,
                            resizable: true,
                            lockPosition: true,
                            lockPinned: true,
                        }}
                        suppressRowTransform={true}
                        getRowHeight={getRowHeight ?? (() => 54)}
                        // Maintain sort state across data updates
                        maintainColumnOrder={true}
                        // Prevent column width changes during sorting
                        suppressColumnVirtualisation={false}
                        suppressAnimationFrame={false}
                        skipHeaderOnAutoSize={true}
                        // Initialize with sort model if provided
                        initialState={sortModel && sortModel.length > 0 ? {
                            sort: {
                                sortModel: sortModel.map(s => ({
                                    colId: s.colId,
                                    sort: s.sort
                                }))
                            }
                        } : undefined}
                    />
                </StyledAgGridWrapper>
                {totalRecords === 0 && <Divider />}
            </Wrapper>
        </GridContainer>
    );
};

export default ServerSideGrid;