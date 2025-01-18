import { useCallback, useEffect, useMemo, useState } from 'react';

import { Button, Link, Paragraph } from '@amsterdam/design-system-react';
import classnames from 'classnames';
import { parseISO } from 'date-fns';
import { generatePath, useHistory, useParams } from 'react-router-dom';

import styles from './InkomenSpecificaties.module.scss';
import { useAddDocumentLinkComponents } from './useAddDocumentLinks';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  ErrorAlert,
  DateInput,
  Pagination,
  Section,
  Table,
} from '../../components';
import { isNativeDatePickerInputSupported } from '../../components/DateInput/DateInput';
import {
  OverviewPageV2,
  PageContentCell,
  PageContentV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../hooks/useAppState';

export const specificationsTableDisplayProps = {
  category: 'Regeling',
  displayDatePublished: 'Datum',
  documentUrl: 'Documenten',
};

export const annualStatementsTableDisplayProps = {
  displayDatePublished: 'Datum',
  documentUrl: 'Documenten',
};

const PAGE_SIZE = 10;

function Caret() {
  return <i className={styles.SearchButtonIcon}>&#9698;</i>;
}

export default function InkomenSpecificaties() {
  const { WPI_SPECIFICATIES } = useAppStateGetter();
  const wpiSpecificatiesWithDocumentLinks =
    useAddDocumentLinkComponents(WPI_SPECIFICATIES);
  const { variant = 'uitkering', page = '1' } = useParams<{
    variant: 'jaaropgave' | 'uitkering';
    page?: string;
  }>();
  const isAnnualStatementOverviewPage = variant === 'jaaropgave';
  const history = useHistory();
  const items = useMemo(() => {
    return (
      (isAnnualStatementOverviewPage
        ? wpiSpecificatiesWithDocumentLinks.content?.jaaropgaven
        : wpiSpecificatiesWithDocumentLinks.content?.uitkeringsspecificaties) ||
      []
    );
  }, [isAnnualStatementOverviewPage, wpiSpecificatiesWithDocumentLinks]);

  const maxDate = useMemo(() => {
    if (items.length) {
      return parseISO(items[0].datePublished);
    }
    return new Date();
  }, [items]);

  const minDate = useMemo(() => {
    if (items.length) {
      return parseISO(items[items.length - 1].datePublished);
    }
    return new Date();
  }, [items]);

  const [isSearchPanelActive, setSearchPanelActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedDates, setSelectedDates] = useState<[Date, Date]>([
    minDate,
    maxDate,
  ]);

  useEffect(() => {
    // Set initial date selection
    if (minDate && maxDate) {
      setSelectedDates([minDate, maxDate]);
    }
  }, [minDate, maxDate]);

  const categoryFilterOptions: Array<[string, number]> = useMemo(() => {
    return Array.from(
      items.reduce((acc: Map<string, number>, item) => {
        acc.set(item.category, (acc.get(item.category) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    );
  }, [items]);

  const itemsFiltered = items
    .filter((item) =>
      selectedCategory ? item.category === selectedCategory : true
    )
    .filter((item) => {
      const datePublished = parseISO(item.datePublished);
      return (
        datePublished >= selectedDates[0] && datePublished <= selectedDates[1]
      );
    });

  const currentPage = useMemo(() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  }, [page]);

  useEffect(() => {
    window.scrollBy({
      top: -document.documentElement.scrollTop,
      left: 0,
      behavior: 'smooth',
    });
  }, [currentPage]);

  const itemsFilteredPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return itemsFiltered.slice(start, end);
  }, [currentPage, itemsFiltered]);

  const total = itemsFiltered.length;
  const hasCategoryFilters = categoryFilterOptions.length > 1;
  const categoryFilterActive = !!selectedCategory;
  const minDateFilterActive =
    selectedDates[0].toString() !== minDate.toString();
  const maxDateFilterActive =
    selectedDates[1].toString() !== maxDate.toString();

  const selectCategoryFilter = useCallback(
    (category: string) => {
      setSelectedCategory(category);
      history.replace(
        generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
          page: '1',
          variant,
        })
      );
    },
    [variant, history]
  );

  function resetSearch() {
    setSelectedCategory('');
    setSelectedDates([minDate, maxDate]);
  }

  function toggleSearchPanel() {
    const isActive = !isSearchPanelActive;
    setSearchPanelActive(isActive);
    if (!isActive) {
      resetSearch();
    }
  }

  return (
    <OverviewPageV2
      className={classnames(
        styles.InkomenSpecificaties,
        isAnnualStatementOverviewPage &&
          styles['SpecificationsTable--annualStatements']
      )}
    >
      <PageContentV2>
        <PageHeadingV2 backLink={AppRoutes.INKOMEN}>
          Bijstandsuitkering
        </PageHeadingV2>
        {isError(WPI_SPECIFICATIES) && (
          <PageContentCell>
            <ErrorAlert>
              We kunnen op dit moment niet alle gegevens tonen.
            </ErrorAlert>
          </PageContentCell>
        )}
        <PageContentCell>
          <Section
            className={styles.TableSection}
            title={
              isAnnualStatementOverviewPage
                ? 'Jaaropgaven'
                : 'Uitkeringsspecificaties'
            }
            isLoading={isLoading(WPI_SPECIFICATIES)}
            hasItems={!!items.length}
            noItemsMessage="Er zijn op dit moment nog geen documenten beschikbaar."
          >
            <Button
              variant="secondary"
              className={classnames(
                styles.SearchButton,
                isSearchPanelActive && styles.SearchButtonActive,
                'ams-mb--sm'
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
                          href={AppRoutes.INKOMEN}
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
                      onChange={(event) =>
                        selectCategoryFilter(event.target.value)
                      }
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
                        onClick={() =>
                          setSelectedDates([minDate, selectedDates[1]])
                        }
                      >
                        resetten
                      </button>
                    )}
                  </span>
                  <DateInput
                    className={classnames(
                      minDateFilterActive && styles.FilterActive
                    )}
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
                    className={classnames(
                      maxDateFilterActive && styles.FilterActive
                    )}
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
            {!itemsFiltered.length && (
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
            {currentPage !== 1 && <Paragraph>Pagina {currentPage}</Paragraph>}
            {!!itemsFiltered.length && (
              <Table
                className={styles.SpecificationsTable}
                items={itemsFilteredPaginated}
                displayProps={
                  isAnnualStatementOverviewPage
                    ? annualStatementsTableDisplayProps
                    : specificationsTableDisplayProps
                }
              />
            )}

            {itemsFiltered.length > PAGE_SIZE && (
              <Pagination
                className={styles.Pagination}
                totalCount={total}
                pageSize={PAGE_SIZE}
                currentPage={currentPage}
                onPageClick={(page) => {
                  history.replace(
                    generatePath(AppRoutes['INKOMEN/SPECIFICATIES'], {
                      page,
                      variant,
                    })
                  );
                }}
              />
            )}
          </Section>
        </PageContentCell>
      </PageContentV2>
    </OverviewPageV2>
  );
}
