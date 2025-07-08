import { Button, Link, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';

import styles from './InkomenSpecificaties.module.scss';
import { useInkomenSpecificatiesListPageData } from './useInkomenSpecificatiesListPageData.hook.ts';
import DateInput, {
  isNativeDatePickerInputSupported,
} from '../../../components/DateInput/DateInput.tsx';
import { ListPagePaginated } from '../../../components/ListPagePaginated/ListPagePaginated.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

function Caret() {
  return <i className={styles.SearchButtonIcon}>&#9698;</i>;
}

export function InkomenListSpecificaties() {
  const {
    categoryFilterActive,
    categoryFilterOptions,
    hasCategoryFilters,
    isError,
    isLoading,
    isSearchPanelActive,
    items,
    itemsFiltered,
    maxDate,
    maxDateFilterActive,
    minDate,
    minDateFilterActive,
    noContentMessage,
    params,
    resetSearch,
    selectCategoryFilter,
    selectedCategory,
    selectedDates,
    setSelectedDates,
    tableConfig,
    title,
    toggleSearchPanel,
    total,
    breadcrumbs,
    themaPageRoute,
    routeConfig,
  } = useInkomenSpecificatiesListPageData();
  useHTMLDocumentTitle(routeConfig.listPageSpecificaties);

  const pageContentMain = (
    <PageContentCell>
      <Button
        variant="secondary"
        className={classnames(
          styles.SearchButton,
          isSearchPanelActive && styles.SearchButtonActive,
          'ams-mb-m'
        )}
        onClick={toggleSearchPanel}
        disabled={isSearchPanelActive}
        icon={Caret}
        aria-expanded={isSearchPanelActive}
      >
        Zoeken
      </Button>

      {isSearchPanelActive && (
        <div className={styles.SearchPanel}>
          {hasCategoryFilters && (
            <div className={styles.FilterInput}>
              <span>
                Regeling{' '}
                {categoryFilterActive && (
                  <Link
                    className={styles.ResetFilterButton}
                    onClick={() => selectCategoryFilter('')}
                    href={themaPageRoute}
                  >
                    resetten
                  </Link>
                )}
              </span>
              <select
                className={classnames(
                  styles.Select,
                  categoryFilterActive && styles.FilterActive
                )}
                value={selectedCategory}
                onChange={(event) => selectCategoryFilter(event.target.value)}
              >
                <option value="">Alle regelingen ({items.length})</option>
                {categoryFilterOptions.map(([option, count]) => (
                  <option key={option} value={option}>
                    {option} ({count})
                  </option>
                ))}
              </select>
            </div>
          )}
          <div className={styles.FilterInput}>
            <span>
              Datum van{' '}
              {minDateFilterActive && (
                <button
                  className={styles.ResetFilterButton}
                  onClick={() => setSelectedDates([minDate, selectedDates[1]])}
                >
                  resetten
                </button>
              )}
            </span>
            <DateInput
              className={classnames(minDateFilterActive && styles.FilterActive)}
              value={selectedDates[0]}
              hasNativeSupport={isNativeDatePickerInputSupported()}
              onChange={(dateStart) => {
                setSelectedDates(([, dateEnd]) => [
                  dateStart || minDate,
                  dateEnd || maxDate,
                ]);
              }}
            />
          </div>
          <div className={styles.FilterInput}>
            <span>
              Datum t/m{' '}
              {maxDateFilterActive && (
                <button
                  className={styles.ResetFilterButton}
                  onClick={() => {
                    setSelectedDates([selectedDates[0], maxDate]);
                  }}
                >
                  resetten
                </button>
              )}
            </span>
            <DateInput
              className={classnames(maxDateFilterActive && styles.FilterActive)}
              value={selectedDates[1]}
              hasNativeSupport={isNativeDatePickerInputSupported()}
              onChange={(dateEnd) =>
                setSelectedDates(([dateStart]) => [
                  dateStart || minDate,
                  dateEnd || maxDate,
                ])
              }
            />
          </div>
        </div>
      )}
      {!itemsFiltered.length && !isLoading && (
        <Paragraph>
          Zoeken heeft geen resultaten opgeleverd.{' '}
          <Button
            onClick={resetSearch}
            variant="tertiary"
            className={styles.ResetButton}
          >
            Resetten
          </Button>
        </Paragraph>
      )}
    </PageContentCell>
  );

  return (
    <ListPagePaginated
      title={title}
      isError={isError}
      isLoading={isLoading}
      appRoute={tableConfig.listPageRoute}
      breadcrumbs={breadcrumbs}
      pageContentTop={pageContentMain}
      displayProps={tableConfig.displayProps}
      noItemsText={noContentMessage}
      items={itemsFiltered}
      totalCount={total}
    />
  );
}
