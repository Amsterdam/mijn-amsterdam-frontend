import { PropsWithChildren, useMemo } from 'react';

import { Pagination } from '@amsterdam/design-system-react';
import paginate from 'jw-paginate';
import { useNavigate } from 'react-router';

export interface PaginationPageButtonProps extends PropsWithChildren {
  page: number;
  currentPage: number;
}

export interface PaginationProps {
  totalCount: number;
  path: string;
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
  path,
  currentPage = 1,
  className,
}: PaginationProps) {
  const { totalPages } = useMemo(
    () => paginate(totalCount, currentPage, pageSize, maxPages),
    [currentPage, pageSize, totalCount, maxPages]
  );
  const navigate = useNavigate();

  return (
    <Pagination
      className={className}
      maxVisiblePages={maxPages}
      linkComponent={function PaginationLink({ children, href, ...rest }) {
        return (
          <a
            {...rest}
            onClick={(event) => {
              if (href) {
                event.preventDefault();
                navigate(href);
              }
            }}
            href={href}
          >
            {children}
          </a>
        );
      }}
      linkTemplate={function p(x) {
        return `${path}/${x}`;
      }}
      page={currentPage}
      totalPages={totalPages}
    />
  );
}
