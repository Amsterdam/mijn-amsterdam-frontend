import React, { useCallback, useState, useEffect } from 'react';
import styles from './Pagination.module.scss';
import classnames from 'classnames';
import { ReactComponent as ArrowRightIcon } from 'assets/icons/Chevron-Right.svg';
import { ReactComponent as ArrowLeftIcon } from 'assets/icons/Chevron-Left.svg';
import paginate from 'jw-paginate';

export interface ComponentProps {
  totalCount: number;
  onPageClick: (page: number, startIndex: number, endIndex: number) => void;
  className?: string;
  pageSize: number;
  maxPages?: number;
}

export default function Pagination({
  totalCount,
  pageSize,
  maxPages = 5,
  onPageClick,
  className,
}: ComponentProps) {
  const [{ currentPage, pages, totalPages }, setPager] = useState(
    paginate(totalCount, 1, pageSize, maxPages)
  );

  const selectPage = useCallback(
    (page: number) => {
      const pagerState = paginate(totalCount, page, pageSize, maxPages);
      const { startIndex, endIndex } = pagerState;
      setPager(pagerState);
      onPageClick(page, startIndex, endIndex);
    },
    [onPageClick, totalCount, pageSize, maxPages]
  );

  // Effect for resetting the current page when any of the settings change.
  useEffect(() => {
    selectPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCount, pageSize, maxPages]);

  return (
    <nav className={classnames(styles.Pagination, className)}>
      <ul className={styles.PageList}>
        {currentPage !== 1 && (
          <li
            onClick={() => selectPage(currentPage - 1)}
            className={classnames(
              styles.PageSelectButton,
              styles.PagePrevButton
            )}
          >
            <ArrowLeftIcon />
            vorige
          </li>
        )}
        {pages.map((page, index) => (
          <li key={page}>
            <button
              className={classnames(
                styles.PageSelectButton,
                page === currentPage && styles.SelectedPage
              )}
              onClick={() => selectPage(page)}
            >
              {page}
            </button>
          </li>
        ))}
        {currentPage !== totalPages && (
          <li
            onClick={() => selectPage(currentPage + 1)}
            className={classnames(
              styles.PageSelectButton,
              styles.PageNextButton
            )}
          >
            volgende <ArrowRightIcon />
          </li>
        )}
      </ul>
    </nav>
  );
}
