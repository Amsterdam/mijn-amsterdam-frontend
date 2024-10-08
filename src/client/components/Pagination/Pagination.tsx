import { PropsWithChildren, useMemo } from 'react';

import classnames from 'classnames';
import paginate from 'jw-paginate';

import styles from './Pagination.module.scss';
import { IconChevronLeft, IconChevronRight } from '../../assets/icons';

export interface PaginationPageButtonProps extends PropsWithChildren {
  page: number;
  currentPage: number;
  onPageClick: PaginationProps['onPageClick'];
}

function PaginationPageButton({
  page,
  currentPage,
  onPageClick,
  children,
}: PaginationPageButtonProps) {
  return (
    <button
      key={page}
      className={classnames(
        styles.PageSelectButton,
        page === currentPage && styles.SelectedPage
      )}
      onClick={() => onPageClick(page)}
      aria-current={page === currentPage}
      aria-label={
        page === currentPage
          ? `Huidige pagina, pagina ${page}`
          : `Ga naar pagina ${page}`
      }
    >
      {children}
    </button>
  );
}

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
  className,
  currentPage = 1,
}: PaginationProps) {
  const { pages, totalPages } = useMemo(
    () => paginate(totalCount, currentPage, pageSize, maxPages),
    [currentPage, pageSize, totalCount, maxPages]
  );

  return (
    <nav
      className={classnames(styles.Pagination, className)}
      aria-label="Pagina navigatie"
    >
      <div className={styles.PageList}>
        {currentPage !== 1 && (
          <button
            className={classnames(
              styles.PageSelectButton,
              styles.PagePrevButton
            )}
            onClick={() => onPageClick(currentPage - 1)}
            aria-label="Ga naar de vorige pagina"
          >
            <IconChevronLeft aria-hidden={true} />
            vorige
          </button>
        )}
        {totalPages > MAX_PAGES && currentPage - 2 > 1 && (
          <PaginationPageButton
            page={1}
            currentPage={-1}
            onPageClick={onPageClick}
          >
            1 ...
          </PaginationPageButton>
        )}
        {pages.map((page, index) => (
          <PaginationPageButton
            key={`page-${page}`}
            page={page}
            currentPage={currentPage}
            onPageClick={onPageClick}
          >
            {page}
          </PaginationPageButton>
        ))}
        {totalPages > MAX_PAGES && totalPages - 2 >= currentPage && (
          <PaginationPageButton
            page={totalPages}
            currentPage={-1}
            onPageClick={onPageClick}
          >
            ... {totalPages}
          </PaginationPageButton>
        )}
        {currentPage !== totalPages && (
          <button
            className={classnames(
              styles.PageSelectButton,
              styles.PageNextButton
            )}
            onClick={() => onPageClick(currentPage + 1)}
            aria-label="Ga naar de volgende pagina"
          >
            volgende <IconChevronRight aria-hidden={true} />
          </button>
        )}
      </div>
    </nav>
  );
}
