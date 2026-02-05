import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
} from 'react';

import { Paragraph, SearchField, Select } from '@amsterdam/design-system-react';
import { useParams } from 'react-router';

import styles from './ListPagePaginated.module.scss';
import {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types';
import { usePageTypeSetting } from '../../hooks/useThemaMenuItems';
import ErrorAlert from '../Alert/Alert';
import LoadingContent from '../LoadingContent/LoadingContent';
import { PageContentCell, PageV2 } from '../Page/Page';
import { PaginationV2 } from '../Pagination/PaginationV2';
import { DisplayProps, TableV2 } from '../Table/TableV2';

const DEFAULT_PAGE_SIZE = 10;
const BIGGEST_PAGE_SIZE = 100;

interface PaginationSizeOptions {
  value: number;
  name: string;
}

const paginationSizeOptions: PaginationSizeOptions[] = [
  { value: 10, name: '10' },
  { value: 20, name: '20' },
  { value: 50, name: '50' },
  { value: BIGGEST_PAGE_SIZE, name: BIGGEST_PAGE_SIZE.toString() },
  { value: 99999, name: 'Alle' },
];

interface ListPagePaginatedProps<T> {
  appRoute: string;
  breadcrumbs?: LinkProps[];
  pageContentTop?: ReactNode;
  pageContentBottom?: ReactNode;
  displayProps: DisplayProps<T>;
  filter?: any;
  errorText?: string;
  isError: boolean;
  isLoading: boolean;
  items: T[];
  noItemsText?: string;
  noItemsFilter?: string;
  tableClassName?: string;
  title: string;
  themaId: string;
  totalCount?: number;
}

const ListPageSearchBar = memo(
  ({
    search,
    setSearch,
    title,
  }: {
    search: string;
    setSearch: (value: string) => void;
    title: string;
  }) => {
    return (
      <SearchField
        className={styles.SearchFieldContainer}
        onSubmit={(e) => e.preventDefault()}
      >
        <SearchField.Input
          placeholder={`${title} zoeken`}
          onChange={(e) => setSearch(e.target.value)}
          value={search}
        />
        <SearchField.Button />
      </SearchField>
    );
  }
);

ListPageSearchBar.displayName = 'ListPageSearchBar';

export function ListPagePaginated<T extends object = ZaakAanvraagDetail>({
  appRoute,
  breadcrumbs,
  pageContentTop,
  pageContentBottom,
  displayProps,
  filter,
  errorText = 'We kunnen op dit moment niet alle gegevens tonen.',
  noItemsText = 'U heeft (nog) geen gegevens op deze pagina.',
  noItemsFilter = 'Geen resultaten gevonden op basis van deze filters.',
  isError,
  isLoading,
  items,
  totalCount,
  tableClassName,
  title,
  themaId,
}: ListPagePaginatedProps<T>) {
  const [itemsToDisplay, setItemsToDisplay] = useState<T[]>([]);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState<string>('');

  usePageTypeSetting('listpage');

  const { page = '1' } = useParams<{
    page?: string;
  }>();

  const currentPage = (() => {
    if (!page) {
      return 1;
    }
    return parseInt(page, 10);
  })();

  const itemsPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * pageSize;
    const end = start + pageSize;
    return itemsToDisplay.slice(start, end);
  }, [currentPage, itemsToDisplay, pageSize]);

  const total = totalCount ?? itemsToDisplay.length;

  useEffect(() => {
    setItemsToDisplay(items);
  }, [items]);

  useEffect(() => {
    if (!search) {
      setItemsToDisplay(items);
      return;
    }

    const filteredItems = items.filter((item) => {
      return Object.keys(filter.search).some((key) => {
        const itemValue = item[key as keyof T];
        return (
          typeof itemValue === 'string' &&
          itemValue.toLowerCase().includes(search.toLowerCase())
        );
      });
    });

    setItemsToDisplay(filteredItems);
  }, [search, items]);

  // Memoized callback for setting search
  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  function ListPagePaginationNode() {
    return (
      <div className={styles.PaginationContainer}>
        {pageSize > BIGGEST_PAGE_SIZE ? (
          <i></i>
        ) : (
          <PaginationV2
            totalCount={total}
            pageSize={pageSize}
            currentPage={currentPage}
            path={appRoute}
          />
        )}
        <div className={styles.PaginationContainerPageSize}>
          <Paragraph>Aantal resultaten per pagina:</Paragraph>
          <Select
            name="pagination-size"
            value={pageSize}
            onChange={(e) => setPageSize(parseInt(e.target.value))}
          >
            {paginationSizeOptions.map((size) => (
              <Select.Option value={size.value} key={size.name}>
                {size.name}
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    );
  }

  return (
    <PageV2
      breadcrumbs={breadcrumbs}
      heading={title}
      id={themaId}
      redactedThemaId={themaId}
    >
      {isError && (
        <PageContentCell>
          <ErrorAlert>{errorText}</ErrorAlert>
        </PageContentCell>
      )}
      {pageContentTop}
      <PageContentCell>
        {isLoading && (
          <LoadingContent
            barConfig={[
              ['100%', '2rem', '2rem'],
              ['100%', '2rem', '2rem'],
              ['100%', '2rem', '2rem'],
            ]}
          />
        )}
        {!isError && (
          <>
            {!isLoading &&
              !itemsPaginated.length &&
              !!noItemsText &&
              !items.length && <Paragraph>{noItemsText}</Paragraph>}
            <ListPageSearchBar
              search={search}
              setSearch={handleSearchChange}
              title={title}
            />
            {itemsToDisplay.length > DEFAULT_PAGE_SIZE && (
              <ListPagePaginationNode />
            )}
            {!isLoading && !!itemsPaginated.length && (
              <TableV2<T>
                items={itemsPaginated}
                displayProps={displayProps}
                className={tableClassName}
              />
            )}
            {itemsToDisplay.length > DEFAULT_PAGE_SIZE && (
              <ListPagePaginationNode />
            )}
            {!isLoading && !itemsPaginated.length && !!noItemsText && (
              <Paragraph>{noItemsFilter}</Paragraph>
            )}
          </>
        )}
      </PageContentCell>
      {pageContentBottom}
    </PageV2>
  );
}
