# Manual Search & Filter Implementation - Fix Documentation

## Problem Summary

API calls were triggering automatically when:
- Typing in search/filter input fields
- Changing dropdown filter values
- Any `paramValues` state changes

This was especially problematic when:
- Sorting was active
- User was on page 2, 3, etc.
- Grid re-rendered

## Root Cause

1. **Memoized `queryParams`** was dependent on `paramValues`
2. Every keystroke → `paramValues` change → `queryParams` recalculation → `fetchList` dependency change
3. `fetchList` dependency change → `useEffect` trigger → Unwanted API call

## Solution Implemented

### 1. **Converted `queryParams` from `useMemo` to `useCallback`**

**Before:**
```tsx
const queryParams = useMemo(() => {
  // Build params...
  return params;
}, [parameters, paramValues, currentPage, pageSize, sortModel]);
```

**After:**
```tsx
const buildQueryParams = useCallback(() => {
  // Build params on-demand
  return params;
}, [parameters, paramValues, currentPage, pageSize, sortModel]);
```

**Why:** Building params on-demand prevents automatic re-execution when filters change.

---

### 2. **Updated `fetchList` to Build Params Internally**

**Before:**
```tsx
const fetchList = useCallback(async () => {
  const res = await api.getRecords(selectedEntity.name, queryParams);
  // ...
}, [selectedEntity, queryParams]); // queryParams dependency caused auto-trigger
```

**After:**
```tsx
const fetchList = useCallback(async () => {
  const queryParams = buildQueryParams(); // Build only when fetching
  const res = await api.getRecords(selectedEntity.name, queryParams);
  // ...
}, [selectedEntity, api, buildQueryParams]);
```

**Why:** Params are only built when `fetchList` is explicitly called, not on every filter change.

---

### 3. **Added Change Tracking to Prevent Duplicate Fetches**

**Added:**
```tsx
const lastFetchTrigger = useRef<{ page: number; pageSize: number; sort: string }>({ 
  page: 0, 
  pageSize: 0, 
  sort: '' 
});
```

**Purpose:** Track when page, pageSize, or sort actually change to avoid unnecessary API calls.

---

### 4. **Improved `useEffect` with Smart Change Detection**

**Before:**
```tsx
useEffect(() => {
  if (view && (currentPage > 1 || sortModel.length > 0)) {
    fetchList();
  }
}, [currentPage, pageSize, sortModel, view, fetchList]);
```

**Issues:**
- Would trigger on `fetchList` reference change
- Wouldn't fetch on page 1 with no sorting
- Would trigger even when values didn't actually change

**After:**
```tsx
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
```

**Improvements:**
- Only fetches when page/pageSize/sort **actually** change
- Works on any page (including page 1)
- Prevents initial render trigger
- Not affected by filter changes

---

### 5. **Updated `handleView` to Initialize Tracking**

**Before:**
```tsx
const handleView = () => {
  setCurrentPage(1);
  setView(true);
  setTimeout(() => {
    shouldFetchRef.current = true;
    fetchList();
  }, 0);
};
```

**After:**
```tsx
const handleView = () => {
  setCurrentPage(1);
  setView(true);
  // Update tracking ref
  lastFetchTrigger.current = { 
    page: 1, 
    pageSize, 
    sort: JSON.stringify(sortModel) 
  };
  // Fetch immediately when View is clicked
  setTimeout(() => {
    shouldFetchRef.current = true;
    fetchList();
  }, 0);
};
```

**Why:** Initializes tracking state when View is clicked, ensuring subsequent changes are detected correctly.

---

## Behavior After Fix

### ✅ **What DOES Trigger API Calls:**
1. Clicking the **View** button
2. Changing **pagination page** (after View is clicked)
3. Changing **page size** (after View is clicked)
4. **Sorting columns** (after View is clicked)

### ❌ **What DOES NOT Trigger API Calls:**
1. Typing in search input fields
2. Changing filter dropdown values
3. Changing date range filters
4. Any other `paramValues` changes
5. Initial component render
6. Grid re-renders

---

## Testing Scenarios

### Scenario 1: Fresh Search
1. Load page
2. Type in search field → ❌ No API call
3. Select filter values → ❌ No API call
4. Click "View" → ✅ API call with filters

### Scenario 2: Modify Filters While on Page 2
1. Already on page 2 with data
2. Type new search term → ❌ No API call
3. Change filter → ❌ No API call
4. Click "View" → ✅ API call, reset to page 1

### Scenario 3: Sorting with Active Filters
1. Click "View" with filters → ✅ API call
2. Click sort on column → ✅ API call with sort + filters
3. Type in search → ❌ No API call
4. Click "View" → ✅ API call with new filters + sort

### Scenario 4: Pagination
1. Click "View" → ✅ API call page 1
2. Click page 2 → ✅ API call page 2
3. Change search while on page 2 → ❌ No API call
4. Click "View" → ✅ API call page 1 with new filters

### Scenario 5: Page Size Change
1. On page 2 with data
2. Change page size from 10 to 20 → ✅ API call with new page size
3. Type in filter → ❌ No API call

---

## Key Principles

1. **Manual Trigger**: API calls only happen on explicit user actions (View button, pagination, sorting)
2. **No Auto-Search**: Typing/changing filters never triggers API calls
3. **Consistent Behavior**: Works the same regardless of current page, sort state, or grid state
4. **Existing Logic Preserved**: Sorting and pagination logic remains unchanged

---

## Files Modified

- `/src/pages/MasterView/MasterView.tsx`
  - Line ~62: Added `lastFetchTrigger` ref
  - Line ~130: Changed `queryParams` useMemo to `buildQueryParams` useCallback
  - Line ~189: Updated `fetchList` to build params internally
  - Line ~218: Improved useEffect with change detection
  - Line ~230: Updated `handleView` to initialize tracking

---

## Migration Notes

- No breaking changes
- Export functionality unaffected (builds its own params)
- Sorting and pagination work exactly as before
- Filter values are still captured and sent when View is clicked
