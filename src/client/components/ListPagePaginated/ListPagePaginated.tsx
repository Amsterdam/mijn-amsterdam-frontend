import {
  ReactNode,
  useEffect,
  useMemo,
  useState,
  useCallback,
  memo,
} from 'react';

import {
  Button,
  Paragraph,
  SearchField,
  Select,
} from '@amsterdam/design-system-react';
import isEmpty from 'lodash.isempty';
import orderBy from 'lodash.orderby';
import { useNavigate, useParams } from 'react-router';

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
import {
  DisplayProps,
  FilterOrderProps,
  FilterProps,
  TableV2,
} from '../Table/TableV2';
import { FilterIcon } from '@amsterdam/design-system-react-icons';

const DEFAULT_PAGE_SIZE = 10;
const BIGGEST_PAGE_SIZE = 100;
const DEFAULT_CURRENT_ORDER = {
  key: '',
  direction: '',
};

interface PaginationSizeOptions {
  value: number;
  name: string;
}

interface FilterOptionsProps {
  key: FilterOrderProps['key'];
  options: { value: string; selected: boolean }[];
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
  filter?: FilterProps<T>;
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
  filter = {},
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
  const navigate = useNavigate();

  const [itemsToDisplay, setItemsToDisplay] = useState<T[]>([]);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<FilterOrderProps>(
    DEFAULT_CURRENT_ORDER
  );
  const [filterOptions, setFilterOptions] = useState<FilterOptionsProps[]>([]);

  usePageTypeSetting('listpage');

  const { page = '1' } = useParams<{
    page?: string;
  }>();

  const [currentPage, setCurrentPage] = useState<number>(
    parseInt(page, 10) || 1
  );

  const itemsPaginated = useMemo(() => {
    const startIndex = currentPage - 1;
    const start = startIndex * pageSize;
    const end = start + pageSize;
    return itemsToDisplay.slice(start, end);
  }, [currentPage, itemsToDisplay, pageSize]);

  const total = totalCount ?? itemsToDisplay.length;

  useEffect(() => {
    if (!items.length) return;
    setItemsToDisplay(items);
    getFilterOptions(items);
  }, [items]);

  useEffect(() => {
    let filteredItems: T[] = [];
    if (search) {
      // filter based on search value
      filteredItems = items.filter((item) => {
        return Object.keys(filter.search).some((key) => {
          const itemValue = item[key as keyof T];
          return (
            typeof itemValue === 'string' &&
            itemValue.toLowerCase().includes(search.toLowerCase())
          );
        });
      });
    } else {
      filteredItems = items;
    }

    // order by if order has been selected
    if (currentOrder.key && currentOrder.direction) {
      filteredItems = orderBy(
        filteredItems,
        [orderKeyUnformatted(currentOrder.key)],
        [currentOrder.direction]
      );
    }

    setItemsToDisplay(filteredItems);
  }, [search, items]);

  useEffect(() => {
    setCurrentPage(parseInt(page, 10) || 1);
  }, [page]);

  const orderListBy = (key: FilterOrderProps['key']) => {
    let direction = '';

    if (currentOrder.direction === '' || currentOrder.key !== key) {
      direction = 'asc';
    } else if (currentOrder.direction === 'asc') {
      direction = 'desc';
    } else {
      setCurrentOrder({ key: '', direction: '' });
      return;
    }

    const orderedItems = orderBy(
      itemsToDisplay,
      [orderKeyUnformatted(key)],
      [direction]
    );

    setItemsToDisplay(orderedItems);
    setCurrentOrder({ key, direction });
  };

  const getFilterOptions = (items: T[]) => {
    const filterList = [];
    for (const key in filter.filter) {
      const optValues = Array.from(new Set(items.map((x) => x[key])));
      filterList.push({
        key,
        options: optValues.map((x) => ({ value: x, selected: false })),
      });
    }
    setFilterOptions(filterList);
  };

  const orderKeyUnformatted = (key: FilterOrderProps['key']) => {
    return key.endsWith('Formatted') ? key.slice(0, -'Formatted'.length) : key;
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
    navigate('/facturen-en-betalen/facturen/lijst/open/1', { replace: true });
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    resetToFirstPage();
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
            onChange={(e) => {
              setPageSize(parseInt(e.target.value));
              resetToFirstPage();
            }}
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

            {(!isEmpty(filter.search) || !isEmpty(filter.filter)) && (
              <div className={styles.SearchAndFilterContainer}>
                {!isEmpty(filter.search) ? (
                  <ListPageSearchBar
                    search={search}
                    setSearch={handleSearchChange}
                    title={title}
                  />
                ) : (
                  <i></i>
                )}
                {!isEmpty(filter.filter) && (
                  <Button variant="secondary" icon={FilterIcon}>
                    Filters
                  </Button>
                )}
              </div>
            )}

            {itemsToDisplay.length > DEFAULT_PAGE_SIZE && (
              <ListPagePaginationNode />
            )}

            {!isLoading && !!itemsPaginated.length && (
              <TableV2<T>
                items={itemsPaginated}
                displayProps={displayProps}
                filter={filter}
                currentOrder={currentOrder}
                onHeaderCellClick={(key: FilterOrderProps['key']) =>
                  orderListBy(key)
                }
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
