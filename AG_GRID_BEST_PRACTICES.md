# AG Grid v30+ Best Practices Guide

## Table of Contents
1. [Dependency Management](#dependency-management)
2. [Column Width Stability](#column-width-stability)
3. [Configuration Recommendations](#configuration-recommendations)

---

## Dependency Management

### Package.json Configuration

```json
{
  "peerDependencies": {
    "ag-grid-community": ">=30.0.0 <40.0.0",
    "ag-grid-react": ">=30.0.0 <40.0.0"
  },
  "peerDependenciesMeta": {
    "ag-grid-community": {
      "optional": false
    },
    "ag-grid-react": {
      "optional": false
    }
  }
}
```

### Why This Approach?

#### ✅ `>=30.0.0 <40.0.0` (Recommended)
- **Enforces minimum version 30**: Ensures v30+ features are available
- **No --force required**: Range syntax is more flexible than OR patterns
- **Forward compatible**: Automatically accepts v30-39.x without conflicts
- **Cleaner syntax**: Single range instead of multiple OR conditions
- **npm/yarn friendly**: Better resolution algorithm support

#### ❌ Previous Approach: `^30.0.0 || ^31.0.0 || ^32.0.0...`
- Required manual updates for each new major version
- Could cause peer dependency warnings with newer versions
- More verbose and maintenance-heavy

### Key Benefits

1. **No Force Install**: Range-based peer dependencies prevent `npm ERR! ERESOLVE unable to resolve dependency tree` errors
2. **Client Compatibility**: Client projects using v30-39.x will work seamlessly
3. **Future-Proof**: When v31, v32, etc. release, clients can upgrade without waiting for your package update
4. **Semantic Versioning**: Respects semver by allowing minor/patch updates automatically

### Installation Instructions for Clients

```bash
# Client projects should install AG Grid as regular dependencies
npm install ag-grid-community@^30.0.0 ag-grid-react@^30.0.0
npm install your-package-name

# Or with specific version
npm install ag-grid-community@^32.1.0 ag-grid-react@^32.1.0
npm install your-package-name
```

---

## Column Width Stability

### Problem
By default, AG Grid may adjust column widths during:
- Sorting operations
- Data updates
- Grid re-renders
- Filter changes

### Solution Applied

The following properties ensure column widths remain fixed:

```tsx
<AgGridReact
  defaultColDef={{
    width: 170,                    // Fixed default width
    suppressSizeToFit: true,      // Prevent auto-sizing
    resizable: true,              // Allow manual resize
    lockPosition: true,           // Lock column position
    sortable: true,               // Keep sorting enabled
    unSortIcon: true,             // Show unsort icon
  }}
  suppressColumnVirtualisation={false}
  suppressAnimationFrame={false}
  skipHeaderOnAutoSize={true}
  maintainColumnOrder={true}
  suppressMovableColumns={true}
/>
```

### Configuration Properties Explained

| Property | Purpose | Value |
|----------|---------|-------|
| `suppressSizeToFit` | Prevents columns from auto-sizing to fill container | `true` |
| `lockPosition` | Locks column position (prevents reordering during sort) | `true` |
| `skipHeaderOnAutoSize` | Excludes header when calculating auto-size | `true` |
| `suppressColumnVirtualisation` | Ensures all columns render (prevents width shifts) | `false` |
| `suppressAnimationFrame` | Disables animation frame for layout | `false` |
| `maintainColumnOrder` | Preserves column order across updates | `true` |
| `suppressMovableColumns` | Prevents drag-to-reorder | `true` |
| `resizable` | Allows user to manually resize columns | `true` |

### Per-Column Width Control

For specific column widths, override in column definitions:

```tsx
const columnDefs: ColDef[] = [
  {
    field: 'id',
    headerName: 'ID',
    width: 100,              // Fixed width for this column
    suppressSizeToFit: true, // Ensure it doesn't auto-size
  },
  {
    field: 'name',
    headerName: 'Name',
    flex: 1,                 // Or use flex for proportional sizing
    minWidth: 150,
    maxWidth: 400,
  }
];
```

### Best Practices

#### ✅ DO
- Set explicit `width` or `flex` values for all columns
- Use `suppressSizeToFit: true` to prevent auto-sizing
- Keep `maintainColumnOrder: true` for consistency
- Use `minWidth` and `maxWidth` for flex columns
- Test sorting with various data sizes

#### ❌ DON'T
- Mix `width` and `flex` on the same column
- Use `sizeColumnsToFit()` API if you need fixed widths
- Rely on auto-sizing during data updates
- Forget to set `lockPosition` if column order matters

---

## Configuration Recommendations

### Complete ServerSideGrid Configuration

```tsx
<AgGridReact
  // Theme
  theme="legacy"
  
  // Data
  columnDefs={columns}
  rowData={rows}
  
  // Layout
  domLayout="normal"
  rowModelType="clientSide"
  
  // Column defaults (STABLE WIDTHS)
  defaultColDef={{
    width: 170,
    suppressSizeToFit: true,
    resizable: true,
    lockPosition: true,
    sortable: true,
    unSortIcon: true,
    tooltipValueGetter: (params) => params.value ?? 'N/A',
  }}
  
  // Grid behavior
  suppressRowTransform={true}
  suppressColumnVirtualisation={false}
  suppressAnimationFrame={false}
  skipHeaderOnAutoSize={true}
  maintainColumnOrder={true}
  suppressMovableColumns={true}
  suppressMenuHide={true}
  enableBrowserTooltips={true}
  
  // Row height
  getRowHeight={() => 54}
  
  // Sorting
  onSortChanged={handleSortChanged}
  initialState={sortModel ? {
    sort: { sortModel }
  } : undefined}
  
  // Localization
  localeText={{
    noRowsToShow: 'No data to show',
  }}
/>
```

### Module Registration

Always register required modules at the top of your file:

```tsx
import {
  AllCommunityModule,
  ClientSideRowModelModule,
  ModuleRegistry,
} from "ag-grid-community";

ModuleRegistry.registerModules([
  ClientSideRowModelModule,
  AllCommunityModule
]);
```

### Sorting Implementation

The existing sorting logic is preserved:

```tsx
const handleSortChanged = (event: SortChangedEvent) => {
  // Only handle user-initiated sort changes
  if (event.source !== 'uiColumnSorted') {
    return;
  }

  const newSortModel = event.api
    .getColumnState()
    .filter(col => col.sort)
    .map(col => ({
      colId: col.colId!,
      sort: col.sort as 'asc' | 'desc',
    }));

  // Prevent duplicate calls
  const sortChanged = JSON.stringify(newSortModel) !== 
                      JSON.stringify(lastSortModel.current);
  
  if (sortChanged) {
    lastSortModel.current = newSortModel;
    setSort(newSortModel);
  }
};
```

---

## Testing Checklist

- [ ] Install package in client project without --force
- [ ] Verify AG Grid v30-39 works without peer dependency warnings
- [ ] Sort columns and verify widths remain unchanged
- [ ] Resize columns manually and verify stability
- [ ] Test with different data sizes
- [ ] Verify sorting logic still works correctly
- [ ] Check responsive behavior on different screen sizes
- [ ] Test with server-side pagination and filtering

---

## Version Compatibility Matrix

| Your Package | AG Grid Community | AG Grid React | Status |
|-------------|-------------------|---------------|--------|
| 0.1.7+ | 30.x - 39.x | 30.x - 39.x | ✅ Supported |
| 0.1.7+ | 40.x+ | 40.x+ | ❓ Untested (may need update) |
| 0.1.7+ | < 30.0.0 | < 30.0.0 | ❌ Not supported |

---

## Troubleshooting

### Issue: Peer dependency warning
**Solution**: Update client project's AG Grid to v30+:
```bash
npm install ag-grid-community@^30.0.0 ag-grid-react@^30.0.0
```

### Issue: Columns still resizing during sort
**Solution**: Verify these properties are set:
- `suppressSizeToFit: true` in `defaultColDef`
- `skipHeaderOnAutoSize: true` on grid
- Explicit `width` values in column definitions

### Issue: --force required during install
**Solution**: Check that:
- `peerDependencies` use range syntax: `>=30.0.0 <40.0.0`
- Client has compatible AG Grid versions installed
- No conflicting dependencies in client's dependency tree

---

## References

- [AG Grid Documentation](https://www.ag-grid.com/react-data-grid/)
- [Column Sizing Guide](https://www.ag-grid.com/react-data-grid/column-sizing/)
- [Peer Dependencies Best Practices](https://docs.npmjs.com/cli/v10/configuring-npm/package-json#peerdependencies)
