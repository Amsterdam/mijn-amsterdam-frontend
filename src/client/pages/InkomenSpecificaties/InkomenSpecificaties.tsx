import classnames from 'classnames';
import { parseISO } from 'date-fns';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  Button,
  ChapterIcon,
  DateInput,
  OverviewPage,
  PageContent,
  PageHeading,
  Pagination,
  Section,
  Table,
} from '../../components';
import { isNativeDatePickerInputSupported } from '../../components/DateInput/DateInput';
import { useAppStateGetter } from '../../hooks/useAppState';
import AlertDocumentDownloadsDisabled from '../Inkomen/AlertDocumentDownloadsDisabled';
import styles from './InkomenSpecificaties.module.scss';

export const specificationsTableDisplayProps = {
  title: 'Omschrijving',
  category: 'Regeling',
  displayDatePublished: 'Datum',
  documentUrl: 'Documenten',
};

export const annualStatementsTableDisplayProps = {
  title: 'Omschrijving',
  displayDatePublished: 'Datum',
  documentUrl: 'Documenten',
};

const PAGE_SIZE = 10;
const INITIAL_INDEX = [0, PAGE_SIZE - 1];

function Caret() {
  return <i className={styles.SearchButtonIcon}>&#9698;</i>;
}

export default () => {
  const { FOCUS_SPECIFICATIES } = useAppStateGetter();

  const { category } = useParams<{ category?: 'jaaropgaven' }>();

  const isAnnualStatementOverviewPage = category === 'jaaropgaven';

  const items = useMemo(() => {
    return (
      (isAnnualStatementOverviewPage
        ? FOCUS_SPECIFICATIES.content?.jaaropgaven
        : FOCUS_SPECIFICATIES.content?.uitkeringsspecificaties) || []
    );
  }, [
    isAnnualStatementOverviewPage,
    FOCUS_SPECIFICATIES.content?.jaaropgaven,
    FOCUS_SPECIFICATIES.content?.uitkeringsspecificaties,
  ]);

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

  const options: Array<[string, number]> = useMemo(() => {
    return Array.from(
      items.reduce((acc: Map<string, number>, item) => {
        acc.set(item.category, (acc.get(item.category) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    );
  }, [items]);

  const [[startIndex, endIndex], setPageIndex] = useState(INITIAL_INDEX);

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

  const itemsFilteredPaginated = itemsFiltered.slice(startIndex, endIndex + 1);
  const categoryFilterActive = !!selectedCategory;
  const minDateFilterActive =
    selectedDates[0].toString() !== minDate.toString();
  const maxDateFilterActive =
    selectedDates[1].toString() !== maxDate.toString();

  const selectCategoryFilter = useCallback((category) => {
    setSelectedCategory(category);
    setPageIndex(INITIAL_INDEX);
  }, []);

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
    <OverviewPage
      className={classnames(
        styles.InkomenSpecificaties,
        isAnnualStatementOverviewPage &&
          styles['SpecificationsTable--annualStatements']
      )}
    >
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
        isLoading={isLoading(FOCUS_SPECIFICATIES)}
      >
        Bijstandsuitkering {isAnnualStatementOverviewPage && 'Jaaropgaven'}
      </PageHeading>
      <PageContent>
        {isError(FOCUS_SPECIFICATIES) && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
        <AlertDocumentDownloadsDisabled />
      </PageContent>
      <Section
        className={styles.TableSection}
        title={
          isAnnualStatementOverviewPage
            ? 'Jaaropgaven'
            : 'Uitkeringsspecificaties'
        }
        isLoading={isLoading(FOCUS_SPECIFICATIES)}
        hasItems={!!items.length}
        noItemsMessage={
          'Er zijn op dit moment nog geen documenten beschikbaar.'
        }
      >
        <Button
          variant="secondary-inverted"
          className={classnames(
            styles.SearchButton,
            isSearchPanelActive && styles.SearchButtonActive
          )}
          onClick={toggleSearchPanel}
          disabled={isSearchPanelActive}
          icon={Caret}
          iconPosition="right"
          aria-expanded={isSearchPanelActive}
        >
          Zoeken
        </Button>

        {isSearchPanelActive && (
          <div className={styles.SearchPanel}>
            {items.some((item) => !!item.category) && (
              <div className={styles.FilterInput}>
                <span>
                  Regeling{' '}
                  {categoryFilterActive && (
                    <button
                      className={styles.ResetFilterButton}
                      onClick={() => setSelectedCategory('')}
                    >
                      resetten
                    </button>
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
                  {options.map(([option, count]) => (
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
          <p>
            Zoeken heeft geen resultaten opgeleverd.{' '}
            <Button
              onClick={resetSearch}
              variant="inline"
              className={styles.ResetButton}
            >
              Resetten
            </Button>
          </p>
        )}
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
            totalCount={itemsFiltered.length}
            pageSize={PAGE_SIZE}
            onPageClick={(page, ...index) => setPageIndex(index)}
          />
        )}
      </Section>
    </OverviewPage>
  );
};
