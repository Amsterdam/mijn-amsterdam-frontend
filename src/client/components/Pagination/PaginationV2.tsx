import { PropsWithChildren, useMemo } from 'react';

import { Pagination } from '@amsterdam/design-system-react';
import paginate from 'jw-paginate';

export interface PaginationPageButtonProps extends PropsWithChildren {
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
  className?: string;
}

const MAX_PAGES = 7;

export function PaginationV2({
  totalCount,
  pageSize,
  maxPages = MAX_PAGES,
  onPageClick,
  currentPage = 1,
  className,
}: PaginationProps) {
  const { totalPages } = useMemo(
    () => paginate(totalCount, currentPage, pageSize, maxPages),
    [currentPage, pageSize, totalCount, maxPages]
  );

  return (
    <Pagination
      className={className}
      maxVisiblePages={maxPages}
      onPageChange={onPageClick}
      page={currentPage}
      totalPages={totalPages}
    />
  );
}
