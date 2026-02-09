import { Box, Button } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

interface PaginationProps {
  totalRecords: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

const Pagination = ({
  totalRecords,
  currentPage,
  pageSize,
  onPageChange,
}: PaginationProps) => {
  const totalPages = Math.ceil(totalRecords / pageSize) || 1;

  // limit visible pages (like 1 2 3 4 5)
  const getPages = () => {
    const pages: number[] = [];
    const maxVisible = 5;

    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);

    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      {/* Previous */}
      <Button
        variant="text"
        size="small"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        sx={{ minWidth: 36, height: 36 }}
      >
        <ChevronLeftIcon />
      </Button>

      {/* Page numbers */}
      {getPages().map((page) => (
        <Button
          key={page}
          onClick={() => onPageChange(page)}
          variant="text"
          sx={{
            minWidth: 40,
            height: 40,
            borderRadius: 1,
            fontWeight: 500,
            backgroundColor: page === currentPage ? '#2f2f2f' : 'transparent',
            color: page === currentPage ? '#fff' : '#000',
            '&:hover': {
              backgroundColor:
                page === currentPage ? '#2f2f2f' : 'rgba(0,0,0,0.04)',
            },
          }}
        >
          {page}
        </Button>
      ))}

      {/* Next */}
      <Button
        variant="text"
        size="small"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        sx={{ minWidth: 36, height: 36 }}
      >
        <ChevronRightIcon />
      </Button>
    </Box>
  );
};

export default Pagination;
