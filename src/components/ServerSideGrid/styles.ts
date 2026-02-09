import {
  Box,
  FormControl,
  Select,
  styled,
} from "@mui/material";

export const Wrapper = styled(Box)(({ theme }) => ({
  width: "100%",
  fontFamily: theme.typography.fontFamily,
}));

export const GridContainer = styled("div")(({ theme }) => ({
  width: "100%",
  "& .ag-header": {
    borderRadius: "8px 8px 0 0",
  },
  "& .ag-theme-alpine": {
    fontFamily: theme.typography.fontFamily,
    "--ag-border-color": "#e0e0e0",
    "--ag-row-border-color": "#e0e0e0",
    "--ag-header-background-color": "#f5f5f5",
    "--ag-odd-row-background-color": "#ffffff",
    "--ag-row-hover-color": "rgba(0, 0, 0, 0.04)",
  },
  "& .ag-header-cell-text": {
    fontSize: "14px",
    fontWeight: 500,
    color: "#1f2937",
  },
  "& .ag-cell": {
    fontSize: "14px",
    fontWeight: 400,
    color: "#374151",
    padding: "12px 16px",
    display: "flex",
    alignItems: "center",
    // borderRight: "1px solid #e0e0e0",
  },
  "& .ag-row-selected": {
    backgroundColor: "transparent !important",
  },
  "& .ag-row-selected::before": {
    display: "none !important",
  },
  "& .ag-row:hover": {
    backgroundColor: "rgba(0, 0, 0, 0.04) !important",
  },
  "& .right-aligned-cell": {
    textAlign: "right",
  },
  "& .right-aligned-clickable-cell": {
    textAlign: "right",
    cursor: "pointer",
    color: "#1976d2",
    textDecoration: "underline",
  },
  "& .ag-header-cell.right-aligned-header": {
    justifyContent: "flex-end",
  },
  "& .ag-header-cell.right-aligned-header .ag-header-cell-label": {
    justifyContent: "flex-end",
    display: "flex",
    width: "100%",
  },
  "& .ag-cell:focus, .ag-cell:focus-within": {
    border: "1px solid transparent !important",
    outline: "none !important",
  },
  "& .ag-ltr .ag-cell:last-child": {
    borderRight: "none",
  },
}));

export const Loader = styled(Box)(() => ({
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1301,
  background: "rgba(255, 255, 255, 0.5)",
}));

export const PaginationContainer = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-end",
  marginTop: "16px",
  gap: "16px",
  [theme.breakpoints.down("md")]: {
    flexWrap: "wrap",
    justifyContent: "center",
    gap: "12px",
  },
  [theme.breakpoints.down("sm")]: {
    flexDirection: "column",
    alignItems: "center",
    gap: "16px",
  },
}));

export const StyledSelect = styled(Select)(() => ({
  fontSize: "14px",
  border: "none",
  boxShadow: "none",
  ".MuiOutlinedInput-notchedOutline": {
    border: "none",
  },
  padding: "0px",
  "& .MuiSelect-icon": {
    right: 0,
  },
  "& .MuiInputBase-input": {
    padding: 0,
    paddingLeft: "8px",
    paddingRight: "32px !important",
  },
}));

interface StyledAgGridWrapperProps {
  height?: number;
}

export const StyledAgGridWrapper = styled(Box)<StyledAgGridWrapperProps>(
  ({ height }) => ({
    ...(height !== undefined && {
      height: `${height}px`,
    }),
    "&.ag-theme-alpine": {
      border: "none !important",
      borderRadius: "8px",
      overflow: "hidden",
    },
    ".ag-root-wrapper": {
      border: "none !important",
      borderRadius: "8px",
    },
    ".ag-header": {
      // borderBottom: "none !important",
      backgroundColor: "#f5f5f5",
    },
    ".ag-body-viewport": {
      border: "none !important",
    },
    ".ag-header-cell img[alt='sort']": {
      display: "none",
      opacity: 0,
      transition: "opacity 0.2s ease, visibility 0.2s ease",
    },
    ".ag-header-cell:hover img[alt='sort']": {
      display: "block",
      opacity: 1,
    },
    ".ag-row.ag-row-pinned": {
      borderBottom: "2px solid #e0e0e0",
    },
    ".ag-header-cell": {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
    },
    ".ag-header-cell:last-child": {
      borderRight: "none",
    },
  })
);

export const ServerSideGridStyledFormControl = styled(FormControl)(
  ({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    [theme.breakpoints.down("sm")]: {
      flexWrap: "wrap",
      justifyContent: "center",
      gap: "8px",
    },
  })
);

export const StyledBox = styled(Box)(({ theme }) => ({
  fontWeight: 300,
  fontSize: "14px",
  [theme.breakpoints.down("sm")]: {
    fontSize: "12px",
  },
}));
