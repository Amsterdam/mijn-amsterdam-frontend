
import { OverviewPage, PageContent } from '../../components/Page/Page';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Alert from '../../components/Alert/Alert';
import { AppContext } from '../../AppState';
import { AppRoutes } from '../../config/Routing.constants';
import { Button } from '../../components/Button/Button';
import ChapterIcon from '../../components/ChapterIcon/ChapterIcon';
import { ChapterTitles } from '../../config/Chapter.constants';
import classnames from 'classnames';
import DateInput, {
  isNativeDatePickerInputSupported,
} from 'components/DateInput/DateInput';
import PageHeading from '../../components/PageHeading/PageHeading';
import Pagination from '../../components/Pagination/Pagination';
import { ReactComponent as SearchIcon } from '../../assets/icons/Search.svg';
import Section from '../../components/Section/Section';
import Table from '../../components/Table/Table';
import { format } from 'date-fns';
import styles from './InkomenSpecificaties.module.scss';
import useRouter from 'use-react-router';
import { parseISO } from 'date-fns';

export const specificationsTableDisplayProps = {
  title: 'Omschrijving',
  type: 'Regeling',
  displayDate: 'Datum',
  documentUrl: 'Documenten',
};

export const annualStatementsTableDisplayProps = {
  title: 'Omschrijving',
  displayDate: 'Datum',
  documentUrl: 'Documenten',
};

const PAGE_SIZE = 10;
const INITIAL_INDEX = [0, PAGE_SIZE - 1];

function Caret() {
  return <i className={styles.SearchButtonIcon}>&#9698;</i>;
}

export default () => {
  const {
    FOCUS_SPECIFICATIONS: {
      data: { jaaropgaven, uitkeringsspecificaties },
      isError,
      isLoading,
    },
  } = useContext(AppContext);

  const {
    match: {
      params: { type },
    },
  } = useRouter();

  const isAnnualStatementOverviewPage = type === 'jaaropgaven';

  const items = isAnnualStatementOverviewPage
    ? jaaropgaven
    : uitkeringsspecificaties;

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
  const [selectedType, setSelectedType] = useState('');
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
        acc.set(item.type, (acc.get(item.type) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    );
  }, [items]);

  const [[startIndex, endIndex], setPageIndex] = useState(INITIAL_INDEX);

  const itemsFiltered = items
    .filter(item => (selectedType ? item.type === selectedType : true))
    .filter(item => {
      const datePublished = parseISO(item.datePublished);
      return (
        datePublished >= selectedDates[0] && datePublished <= selectedDates[1]
      );
    });

  const itemsFilteredPaginated = itemsFiltered.slice(startIndex, endIndex + 1);
  const typeFilterActive = !!selectedType;
  const minDateFilterActive =
    selectedDates[0].toString() !== minDate.toString();
  const maxDateFilterActive =
    selectedDates[1].toString() !== maxDate.toString();

  const selectTypeFilter = useCallback(type => {
    setSelectedType(type);
    setPageIndex(INITIAL_INDEX);
  }, []);

  function resetSearch() {
    setSelectedType('');
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
      >
        Bijstandsuitkering {isAnnualStatementOverviewPage && 'Jaaropgaven'}
      </PageHeading>
      <PageContent>
        {isError && (
          <Alert type="warning">
            <p>We kunnen op dit moment niet alle gegevens tonen.</p>
          </Alert>
        )}
      </PageContent>
      <Section
        className={styles.TableSection}
        title={
          isAnnualStatementOverviewPage
            ? 'Jaaropgaven'
            : 'Uitkeringsspecificaties'
        }
        isLoading={isLoading}
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
            {items.some(item => !!item.type) && (
              <div className={styles.FilterInput}>
                <span>
                  Regeling{' '}
                  {typeFilterActive && (
                    <button
                      className={styles.ResetFilterButton}
                      onClick={() => setSelectedType('')}
                    >
                      resetten
                    </button>
                  )}
                </span>
                <select
                  className={classnames(
                    styles.Select,
                    typeFilterActive && styles.FilterActive
                  )}
                  value={selectedType}
                  onChange={event => selectTypeFilter(event.target.value)}
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
                onChange={dateStart => {
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
                onChange={dateEnd =>
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
