import React from "react";
import {
  Pagination as MuiPagination,
  PaginationItem,
  Stack,
} from "@mui/material";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  hasNext = true,
  hasPrevious = true,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const handleChange = (_event: React.ChangeEvent<unknown>, page: number) => {
    onPageChange(page);
  };

  return (
    <Stack spacing={2} alignItems="center" mt={4}>
      <MuiPagination
        count={totalPages}
        page={currentPage}
        onChange={handleChange}
        color="primary"
        shape="rounded"
        renderItem={(item) => (
          <PaginationItem
            {...item}
            disabled={
              (item.type === "previous" &&
                (currentPage <= 1 || !hasPrevious)) ||
              (item.type === "next" && (currentPage >= totalPages || !hasNext))
            }
          />
        )}
      />
    </Stack>
  );
}
