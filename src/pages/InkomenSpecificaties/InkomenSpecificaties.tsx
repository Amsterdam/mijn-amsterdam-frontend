import { OverviewPage, PageContent } from 'components/Page/Page';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import Alert from 'components/Alert/Alert';
import { AppContext } from 'AppState';
import { AppRoutes } from 'config/Routing.constants';
import { Button } from 'components/Button/Button';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { ChapterTitles } from 'config/Chapter.constants';
import DateInput from 'components/DateInput/DateInput';
import PageHeading from 'components/PageHeading/PageHeading';
import Pagination from 'components/Pagination/Pagination';
import { ReactComponent as SearchIcon } from 'assets/icons/Search.svg';
import Section from 'components/Section/Section';
import Table from 'components/Table/Table';
import classnames from 'classnames';
import styles from './InkomenSpecificaties.module.scss';
import useRouter from 'use-react-router';

export const specificationsTableDisplayProps = {
  title: 'Omschrijving',
  type: 'Type',
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

export default () => {
  const {
    FOCUS_INKOMEN_SPECIFICATIES: {
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
      return new Date(items[0].datePublished);
    }
    return new Date();
  }, [items]);

  const minDate = useMemo(() => {
    if (items.length) {
      return new Date(items[items.length - 1].datePublished);
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
    if (minDate && maxDate) {
      setSelectedDates([minDate, maxDate]);
    }
  }, [minDate, maxDate]);

  const options = useMemo(() => {
    return Array.from(
      items.reduce((acc, item) => {
        acc.set(item.type, (acc.get(item.type) || 0) + 1);
        return acc;
      }, new Map<string, number>())
    );
  }, [items]);

  const [[startIndex, endIndex], setPageIndex] = useState(INITIAL_INDEX);

  const itemsFiltered = items
    .filter(item => (selectedType ? item.type === selectedType : true))
    .filter(item => {
      const datePublished = new Date(item.datePublished);
      return (
        datePublished >= new Date(selectedDates[0]) &&
        datePublished <= new Date(selectedDates[1])
      );
    });

  const itemsFilteredPaginated = itemsFiltered.slice(startIndex, endIndex + 1);

  const selectTypeFilter = useCallback(type => {
    setSelectedType(type);
    setPageIndex(INITIAL_INDEX);
  }, []);

  function resetSearch() {
    setSelectedType('');
    setSelectedDates([minDate, maxDate]);
  }

  return (
    <OverviewPage
      className={classnames(
        styles.InkomenSpecificaties,
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
        hasItems={!!itemsFiltered.length}
        noItemsMessage={
          <>
            Er zijn op dit moment nog geen documenten beschikbaar.{' '}
            {items.length !== itemsFiltered.length && (
              <Button
                onClick={resetSearch}
                variant="inline"
                className={styles.ResetButton}
              >
                Begin opnieuw
              </Button>
            )}
          </>
        }
      >
        {isSearchPanelActive && (
          <div className={styles.SearchPanel}>
            {itemsFiltered.some(item => !!item.type) && (
              <label>
                Type
                <select
                  className={styles.Select}
                  value={selectedType}
                  onChange={event => selectTypeFilter(event.target.value)}
                >
                  <option value="">Alle types ({items.length})</option>
                  {options.map(([option, count]) => (
                    <option key={option} value={option}>
                      {option} ({count})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <label>
              Datum van
              <DateInput
                className={styles.DatePicker}
                value={selectedDates[0]}
                onChange={dateStart => {
                  setSelectedDates(([, dateEnd]) => [
                    dateStart || minDate,
                    dateEnd || maxDate,
                  ]);
                }}
              />
            </label>
            <label>
              Datum tot
              <DateInput
                className={styles.DatePicker}
                value={selectedDates[1]}
                onChange={dateEnd =>
                  setSelectedDates(([dateStart]) => [
                    dateStart || minDate,
                    dateEnd || maxDate,
                  ])
                }
              />
            </label>
          </div>
        )}
        {!isSearchPanelActive && !!itemsFiltered.length && (
          <Button
            className={styles.SearchButton}
            onClick={() => setSearchPanelActive(!isSearchPanelActive)}
            disabled={isSearchPanelActive}
            icon={SearchIcon}
            iconPosition="right"
          >
            Zoeken
          </Button>
        )}
        <Table
          className={styles.SpecificationsTable}
          items={itemsFilteredPaginated}
          displayProps={
            isAnnualStatementOverviewPage
              ? annualStatementsTableDisplayProps
              : specificationsTableDisplayProps
          }
        />

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
