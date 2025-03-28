import { useMemo, useState, useEffect, useCallback } from 'react';

import { parseISO } from 'date-fns';
import { useParams, useHistory, generatePath } from 'react-router-dom';

import { tableConfigSpecificaties } from './Inkomen-thema-config';
import { useInkomenThemaData } from './useInkomenThemaData.hook';
import { AppRoutes } from '../../../universal/config/routes';

export function useInkomenSpecificatiesListPageData() {
  const {
    jaaropgaven,
    specificaties,
    isErrorWpiSpecificaties,
    isLoadingWpiSpecificaties,
    listPageParamKind,
    routes,
    breadcrumbs,
  } = useInkomenThemaData();

  const params = useParams<{
    kind:
      | typeof listPageParamKind.jaaropgaven
      | typeof listPageParamKind.uitkering;
    page?: string;
  }>();
  const { kind = listPageParamKind.uitkering, page = '1' } = params;

  const isJaaropgaven = kind === listPageParamKind.jaaropgaven;
  const history = useHistory();

  const items = isJaaropgaven ? jaaropgaven : specificaties;

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
          kind,
        })
      );
    },
    [kind, history]
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

  return {
    categoryFilterActive,
    categoryFilterOptions,
    hasCategoryFilters,
    isError: isErrorWpiSpecificaties,
    isLoading: isLoadingWpiSpecificaties,
    isSearchPanelActive,
    items,
    itemsFiltered,
    maxDate,
    maxDateFilterActive,
    minDate,
    minDateFilterActive,
    noContentMessage: 'Er zijn op dit moment nog geen documenten beschikbaar.',
    params: {
      kind,
      page,
    },
    resetSearch,
    title: isJaaropgaven ? 'Jaaropgaven' : 'Uitkeringsspecificaties',
    routes,
    selectCategoryFilter,
    selectedCategory,
    selectedDates,
    setSelectedDates,
    tableConfig: tableConfigSpecificaties[kind],
    toggleSearchPanel,
    total,
    breadcrumbs,
  };
}
