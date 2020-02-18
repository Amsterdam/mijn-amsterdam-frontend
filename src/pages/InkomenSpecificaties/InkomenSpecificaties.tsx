import React, { useContext, useState, useMemo, useCallback } from 'react';
import PageHeading from 'components/PageHeading/PageHeading';
import styles from './InkomenSpecificaties.module.scss';
import { OverviewPage } from 'components/Page/Page';
import ChapterIcon from 'components/ChapterIcon/ChapterIcon';
import { AppRoutes } from 'config/Routing.constants';
import { ChapterTitles } from 'config/Chapter.constants';
import { AppContext } from 'AppState';
import Alert from 'components/Alert/Alert';
import useRouter from 'use-react-router';
import Table from 'components/Table/Table';
import Section from 'components/Section/Section';
import Pagination from 'components/Pagination/Pagination';
import { format } from 'date-fns';
import DateInput from 'components/DateInput/DateInput';
import { ReactComponent as SearchIcon } from 'assets/icons/Search.svg';

export const specificationsTableDisplayProps = {
  title: 'Omschrijving',
  type: 'Type',
  displayDate: 'Datum',
  documentUrl: '',
};

const PAGE_SIZE = 10;
const INITIAL_INDEX = [0, PAGE_SIZE - 1];
const DATEPICKER_FORMAT = 'yyyy-MM-dd';

export default () => {
  const {
    FOCUS_INKOMEN_SPECIFICATIES: { data: items, isError, isLoading },
  } = useContext(AppContext);

  const {
    match: {
      params: { type },
    },
  } = useRouter();
  const maxDate = new Date();
  const minDate = new Date(
    maxDate.getFullYear() - 10,
    maxDate.getMonth(),
    maxDate.getDate()
  );
  const maxDateString = format(maxDate, DATEPICKER_FORMAT);
  const minDateString = format(minDate, DATEPICKER_FORMAT);

  const isAnnualStatementOverviewPage = type === 'jaaropgaven';
  const [isSearchPanelActive, setSearchPanelActive] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedDates, setSelectedDates] = useState<[string, string]>([
    minDateString,
    maxDateString,
  ]);

  const itemsByCategory = items.filter(item =>
    isAnnualStatementOverviewPage
      ? item.isAnnualStatement
      : !item.isAnnualStatement
  );

  const options = useMemo(() => {
    return Array.from(
      itemsByCategory.reduce((acc, item) => {
        acc.set(item.type, (acc.get(item.type) || 1) + 1);
        return acc;
      }, new Map<string, number>())
    );
  }, [itemsByCategory]);

  const [[startIndex, endIndex], setPageIndex] = useState(INITIAL_INDEX);
  const itemsFiltered = itemsByCategory
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

  return (
    <OverviewPage className={styles.InkomenSpecificaties}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
      >
        Bijstandsuitkering {isAnnualStatementOverviewPage && 'Jaaropgaven'}
      </PageHeading>
      <PageContent>
        {isError && (
          <Alert type="warning">
            We kunnen op dit moment niet alle gegevens tonen.
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
        noItemsMessage="Er zijn op dit moment nog geen documenten beschikbaar."
      >
        {isSearchPanelActive && (
          <div className={styles.SearchPanel}>
            <label>
              Type
              <select
                className={styles.Select}
                value={selectedType}
                onChange={event => selectTypeFilter(event.target.value)}
              >
                <option value="">Alle types ({itemsByCategory.length})</option>
                {options.map(([option, count]) => (
                  <option key={option} value={option}>
                    {option} ({count})
                  </option>
                ))}
              </select>
            </label>
            <label>
              Datum van
              <DateInput
                className={styles.DatePicker}
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDates[0]}
                onChange={dateStart =>
                  setSelectedDates(([, dateEnd]) => [
                    dateStart || minDateString,
                    dateEnd || maxDateString,
                  ])
                }
              />
            </label>
            <label>
              Datum tot
              <DateInput
                className={styles.DatePicker}
                minDate={minDate}
                maxDate={maxDate}
                value={selectedDates[1]}
                onChange={dateEnd =>
                  setSelectedDates(([dateStart]) => [
                    dateStart || minDateString,
                    dateEnd || maxDateString,
                  ])
                }
              />
            </label>
          </div>
        )}
        {!isSearchPanelActive && (
          <button
            className={styles.SearchButton}
            onClick={() => setSearchPanelActive(!isSearchPanelActive)}
            disabled={isSearchPanelActive}
          >
            Zoeken <SearchIcon />
          </button>
        )}
        <Table
          className={styles.SpecificationsTable}
          items={itemsFilteredPaginated}
          displayProps={specificationsTableDisplayProps}
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
