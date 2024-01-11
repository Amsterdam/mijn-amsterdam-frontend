import { Pagination } from '@amsterdam/design-system-react';
import paginate from 'jw-paginate';
import { PropsWithChildren, useMemo } from 'react';

export interface PaginationPageButtonProps extends PropsWithChildren<{}> {
  page: number;
  currentPage: number;
  onPageClick: PaginationProps['onPageClick'];
}

export interface PaginationProps {
  totalCount: number;
  onPageClick: (page: number) => void;
  pageSize: number;
  maxPages?: number;
  currentPage?: number;
}

export function PaginationV2({
  totalCount,
  pageSize,
  maxPages = 7,
  onPageClick,
  currentPage = 1,
}: PaginationProps) {
  const { totalPages } = useMemo(
    () => paginate(totalCount, currentPage, pageSize, maxPages),
    [currentPage, pageSize, totalCount, maxPages]
  );

  return (
    <Pagination
      maxVisiblePages={maxPages}
      onPageChange={onPageClick}
      page={currentPage}
      totalPages={totalPages}
    />
  );
}
