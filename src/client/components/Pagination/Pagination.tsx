import { PaginationV2 } from './PaginationV2';

export interface PaginationProps {
  totalCount: number;
  onPageClick: (page: number) => void;
  className?: string;
  pageSize: number;
  maxPages?: number;
  currentPage?: number;
}

const MAX_PAGES = 5;
export default function Pagination({
  totalCount,
  pageSize,
  maxPages = MAX_PAGES,
  onPageClick,
  currentPage = 1,
}: PaginationProps) {
  return (
    <PaginationV2
      totalCount={totalCount}
      pageSize={pageSize}
      maxPages={maxPages}
      onPageClick={onPageClick}
      currentPage={currentPage}
    />
  );
}
