import classnames from 'classnames';
import paginate from 'jw-paginate';
import React, { useMemo } from 'react';
import { IconChevronLeft, IconChevronRight } from '../../assets/icons';
import styles from './Pagination.module.scss';

export interface ComponentProps {
  totalCount: number;
  onPageClick: (page: number) => void;
  className?: string;
  pageSize: number;
  maxPages?: number;
  currentPage?: number;
}

export default function Pagination({
  totalCount,
  pageSize,
  maxPages = 5,
  onPageClick,
  className,
  currentPage = 1,
}: ComponentProps) {
  const { pages, totalPages } = useMemo(
    () => paginate(totalCount, currentPage, pageSize, maxPages),
    [currentPage, pageSize, totalCount, maxPages]
  );

  return (
    <nav
      className={classnames(styles.Pagination, className)}
      role="navigation"
      aria-label="Pagina navigatie"
    >
      <ul className={styles.PageList}>
        {currentPage !== 1 && (
          <li>
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
          </li>
        )}
        {pages.map((page, index) => (
          <li key={page}>
            <button
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
              {page}
            </button>
          </li>
        ))}
        {currentPage !== totalPages && (
          <li>
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
          </li>
        )}
      </ul>
    </nav>
  );
}
