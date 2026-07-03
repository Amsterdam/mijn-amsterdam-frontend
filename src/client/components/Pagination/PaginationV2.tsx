import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';

import { Pagination } from '@amsterdam/design-system-react';
import paginate from 'jw-paginate';
import { useNavigate } from 'react-router';

import { IS_PRODUCTION } from '../../../universal/config/env.ts';

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
  // An optional page paramater indicates incorrect usage of the component but we can still handle it gracefully in production by removing this specific expected case from the path. Use generatePath in the caller to create and pass a concretePath to this component instead of a raw path with optional params.
  const normalizedPath = IS_PRODUCTION ? path.replace(/\/:page\?$/, '') : path;

  if (/\/:[a-zA-Z]*/.test(normalizedPath)) {
    throw Error(`Unparsed router path encountered: '${path}'`);
  }
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
        return `${normalizedPath}/${x}`;
      }}
      page={currentPage}
      totalPages={totalPages}
    />
  );
}
