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
import { FilterIcon } from '@amsterdam/design-system-react-icons';
import isEmpty from 'lodash.isempty';
import orderBy from 'lodash.orderby';
import { useLocation, useNavigate, useParams } from 'react-router';

import { FilterModal } from './FilterModal';
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
  TableMutationsOrderProps,
  TableMutations,
  TableV2,
} from '../Table/TableV2';
import { TableMutationsFilterProps } from '../Table/TableV2.types';

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
  tableMutations?: TableMutations<T>;
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
  tableMutations = {},
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
  const location = useLocation();
  const navigate = useNavigate();

  const [itemsToDisplay, setItemsToDisplay] = useState<T[]>([]);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [search, setSearch] = useState<string>('');
  const [currentOrder, setCurrentOrder] = useState<TableMutationsOrderProps>(
    DEFAULT_CURRENT_ORDER
  );
  const [currentFilters, setCurrentFilters] = useState<
    TableMutationsFilterProps[]
  >([]);
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

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

  // --
  // Func
  // --

  const orderKeyUnformatted = (key: TableMutationsOrderProps['key']) => {
    return key.endsWith('Formatted') ? key.slice(0, -'Formatted'.length) : key;
  };

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleOrderChange = (key: TableMutationsOrderProps['key']) => {
    let direction = '';

    if (currentOrder.direction === '' || currentOrder.key !== key) {
      direction = 'asc';
    } else if (currentOrder.direction === 'asc') {
      direction = 'desc';
    } else {
      setCurrentOrder({ key: '', direction: '' });
      return;
    }
    setCurrentOrder({ key, direction });
  };

  const getFilterOptions = (items: T[]) => {
    const filterList: TableMutationsFilterProps[] = [];
    for (const key in tableMutations.filter) {
      const optValues = Array.from(new Set(items.map((x) => x[key])));
      filterList.push({
        key,
        title: tableMutations.filter[key],
        options: optValues.map((x) => ({ value: x, selected: false })),
      });
    }
    setCurrentFilters(filterList);
  };

  const resetToFirstPage = () => {
    setCurrentPage(1);
    const currentPath = location.pathname;
    const newPath = currentPath.replace(/\/\d+$/, '/1');
    navigate(newPath, { replace: true });
  };

  // --
  // UseEffect
  // --

  useEffect(() => {
    if (!items.length) return;
    setItemsToDisplay(items);
    if (!isEmpty(tableMutations.filter)) {
      getFilterOptions(items);
    }
  }, [items]);

  useEffect(() => {
    if (isEmpty(tableMutations)) return;
    let filteredItems = items;

    // search function
    if (!isEmpty(tableMutations.search)) {
      if (search) {
        filteredItems = filteredItems.filter((item) => {
          return Object.keys(tableMutations.search).some((key) => {
            const itemValue = item[key as keyof T];
            return (
              typeof itemValue === 'string' &&
              itemValue.toLowerCase().includes(search.toLowerCase())
            );
          });
        });
      }
    }

    // filter function
    if (!isEmpty(tableMutations.filter)) {
      const hasSelectedOption = currentFilters.some((filter) =>
        filter.options.some((option) => option.selected)
      );
      if (hasSelectedOption) {
        filteredItems = filteredItems.filter((item) => {
          return currentFilters.every((filter) => {
            const selectedOptions = filter.options.filter(
              (option) => option.selected
            );
            if (selectedOptions.length === 0) {
              return true;
            }
            return selectedOptions.some(
              (option) => item[filter.key] === option.value
            );
          });
        });
      }
    }

    // order function
    if (currentOrder.key && currentOrder.direction) {
      filteredItems = orderBy(
        filteredItems,
        [orderKeyUnformatted(currentOrder.key)],
        [currentOrder.direction]
      );
    }

    setItemsToDisplay(filteredItems);
    if (currentPage !== 1) {
      resetToFirstPage();
    }
  }, [search, currentOrder, currentFilters]);

  useEffect(() => {
    setCurrentPage(parseInt(page, 10) || 1);
  }, [page]);

  // --

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

            {(!isEmpty(tableMutations.search) ||
              !isEmpty(tableMutations.filter)) && (
              <div className={styles.SearchAndFilterContainer}>
                {!isEmpty(tableMutations.search) ? (
                  <ListPageSearchBar
                    search={search}
                    setSearch={handleSearchChange}
                    title={title}
                  />
                ) : (
                  <i></i>
                )}
                {!isEmpty(tableMutations.filter) && (
                  <>
                    <Button
                      variant="secondary"
                      icon={FilterIcon}
                      onClick={() => setFilterModalOpen(true)}
                    >
                      Filters
                    </Button>
                    <FilterModal
                      currentFilters={currentFilters}
                      setCurrentFilters={setCurrentFilters}
                      isFilterModalOpen={isFilterModalOpen}
                      onClose={() => setFilterModalOpen(false)}
                    />
                  </>
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
                tableMutations={tableMutations}
                currentOrder={currentOrder}
                onHeaderCellClick={(key: TableMutationsOrderProps['key']) =>
                  handleOrderChange(key)
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
