import { useEffect } from 'react';

import {
  ExternalLinkIcon,
  LocationIcon,
} from '@amsterdam/design-system-react-icons';
import axios from 'axios';
import Fuse from 'fuse.js';
import { matchPath, useLocation } from 'react-router';
import { create } from 'zustand';

import {
  ApiBaseItem,
  ApiSearchConfig,
  SearchEntry,
  apiSearchConfigs,
  displayPath,
  type RemoteApiSearchConfigs,
} from './search-config';
import styles from './Search.module.scss';
import { isError } from '../../../universal/helpers/api';
import { pick, uniqueArray } from '../../../universal/helpers/utils';
import { AppState } from '../../../universal/types/App.types';
import { BFFApiUrls } from '../../config/api';
import { addAxiosResponseTransform } from '../../hooks/api/useDataApi';
import { createGetApiHook } from '../../hooks/api/useDataApi-v2';
import { useSmallScreen } from '../../hooks/media.hook';
import { useAppStateGetter, useAppStateReady } from '../../hooks/useAppState';
import { useProfileTypeValue } from '../../hooks/useProfileType';
import { DashboardRoute } from '../../pages/Dashboard/Dashboard-routes';
import { SearchPageRoute } from '../../pages/Search/Search-routes';
import { routeConfig as buurtRouteConfig } from '../MyArea/MyArea-thema-config';

export function generateSearchIndexPageEntry(
  item: ApiBaseItem,
  apiConfig: ApiSearchConfig
): SearchEntry {
  const props: Array<
    Exclude<keyof ApiSearchConfig, 'getApiBaseItems' | 'stateKey' | 'isEnabled'>
  > = [
    'keywordsGeneratedFromProps',
    'displayTitle',
    'description',
    'url',
    'keywords',
    'generateKeywords',
  ];

  const searchEntry = {} as SearchEntry;

  for (const prop of props) {
    const configValue = apiConfig[prop];
    const value =
      typeof configValue === 'function'
        ? configValue(item, apiConfig)
        : configValue;

    if (!value) {
      continue;
    }

    if (prop === 'keywords' || prop === 'generateKeywords') {
      // @ts-expect-error TODO: properly type this
      searchEntry.keywords = [...(searchEntry.keywords || []), ...value];
    } else if (prop === 'keywordsGeneratedFromProps') {
      // @ts-expect-error TODO: properly type this
      const generatedKeywordValues = Object.values(pick(item, value));
      searchEntry.keywords = [
        ...(searchEntry.keywords || []),
        ...generatedKeywordValues,
      ] as string[];
    } else {
      const key: keyof SearchEntry = prop;
      // @ts-expect-error TODO: properly type this
      searchEntry[key] = value;
    }
  }

  if (searchEntry.keywords) {
    searchEntry.keywords = uniqueArray(searchEntry.keywords.filter((x) => !!x));
  }

  return searchEntry;
}

export function combineApiSearchConfigs(
  localConfigs: ApiSearchConfig[],
  remoteConfigs: RemoteApiSearchConfigs
) {
  return localConfigs.map((apiConfig) => {
    const remoteConfig = remoteConfigs[apiConfig.stateKey];
    if (remoteConfig) {
      const margedApiConfig = { ...apiConfig, ...remoteConfig };
      // Keywords and keywordsGeneratedFromProps are merged.
      apiConfig.keywords = [
        ...(apiConfig.keywords || []),
        ...(remoteConfig.keywords || []),
      ];
      apiConfig.keywordsGeneratedFromProps = [
        ...(apiConfig.keywordsGeneratedFromProps || []),
        ...(remoteConfig.keywordsGeneratedFromProps || []),
      ];
      apiConfig = margedApiConfig;
    }
    return apiConfig;
  });
}

export function generateSearchIndexPageEntries(
  profileType: ProfileType,
  appState: AppState,
  apiSearchConfigs: ApiSearchConfig[]
): SearchEntry[] {
  const apiConfigs = apiSearchConfigs.filter((apiConfig) => {
    const hasProperAppState = !apiConfig.stateKey.endsWith('_BAG')
      ? !isError(appState[apiConfig.stateKey]) && !!appState[apiConfig.stateKey]
      : !!appState[apiConfig.stateKey];

    const isEnabled =
      !!apiConfig && 'isEnabled' in apiConfig ? apiConfig.isEnabled : true;

    return (
      apiConfig.profileTypes?.includes(profileType) &&
      isEnabled &&
      hasProperAppState
    );
  });

  return apiConfigs.flatMap((apiConfig) => {
    const apiContent = apiConfig.stateKey.endsWith('_BAG')
      ? appState[apiConfig.stateKey]
      : appState[apiConfig.stateKey]?.content;

    if (!apiContent) {
      return [];
    }

    return apiConfig
      .getApiBaseItems(apiContent)
      .map((item) => generateSearchIndexPageEntry(item, apiConfig));
  });
}

interface AmsterdamSearchResult {
  title: string;
  highlight: {
    title?: string;
  };
  sections: string[];
  description: string;
  url: string;
}

interface ResponseData {
  records: {
    page: AmsterdamSearchResult[];
  };
}

function transformSearchAmsterdamNLresponse(
  responseData: ResponseData
): SearchEntry[] {
  if (Array.isArray(responseData?.records?.page)) {
    return responseData.records.page.map((page: AmsterdamSearchResult) => {
      return {
        displayTitle: (term: string) =>
          displayPath(term, [page.highlight.title || page.title], false),
        keywords: page.sections,
        description: page.description,
        url: page.url,
        trailingIcon: (
          <ExternalLinkIcon
            width="14"
            height="14"
            className={styles.ExternalUrl}
          />
        ),
      };
    });
  }
  return [];
}

const RESULTS_PER_PAGE = 10;

export async function searchAmsterdamNL(
  keywords: string,
  resultCountPerPage: number = RESULTS_PER_PAGE,
  isExtendedAmsterdamSearch: boolean = false
) {
  const url = isExtendedAmsterdamSearch
    ? `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=zw32MDuzZjzNC8VutizD&page=1&per_page=${resultCountPerPage}&q=${keywords}&spelling=retry`
    : `https://api.swiftype.com/api/v1/public/engines/suggest.json?q=${keywords}&engine_key=zw32MDuzZjzNC8VutizD&per_page=${resultCountPerPage}`;

  const response = await axios.get<SearchEntry[]>(url, {
    transformResponse: addAxiosResponseTransform(
      transformSearchAmsterdamNLresponse
    ),
  });

  return response.data;
}

type SearchTermStore = {
  term: string;
  setTerm: (term: string) => void;
  fuseInstance: Fuse<SearchEntry> | null;
  setFuseInstance: (fuseInstance: Fuse<SearchEntry>) => void;
  isSearchActive: boolean;
  setSearchActive: (active: boolean) => void;
  results: {
    // Mijn Amsterdam
    ma: SearchEntry[];
    // Amsterdam.nl
    am: SearchEntry[];
  };
};

export const useSearchStore = create<SearchTermStore>((set) => ({
  term: '',
  setTerm: (term: string) => set({ term }),
  fuseInstance: null,
  setFuseInstance: (fuseInstance: Fuse<SearchEntry>) => set({ fuseInstance }),
  isSearchActive: false,
  setSearchActive: (active: boolean) => set({ isSearchActive: active }),
  results: {
    ma: [],
    am: [],
  },
  setResults: (results: { ma: SearchEntry[]; am: SearchEntry[] }) =>
    set((state) => ({ results: { ...state.results, ...results } })),
}));

const useSearchConfigRemoteApi = createGetApiHook<{
  staticSearchEntries: SearchEntry[];
  apiSearchConfigs: RemoteApiSearchConfigs;
}>(BFFApiUrls.SEARCH_CONFIGURATION);

export function useSearchConfigJSON() {
  const profileType = useProfileTypeValue();
  const api = useSearchConfigRemoteApi();
  const staticSearchEntries =
    api.data?.content?.staticSearchEntries.filter((indexEntry) => {
      const isEnabled = 'isEnabled' in indexEntry ? indexEntry.isEnabled : true;
      return (
        isEnabled &&
        (!indexEntry.profileTypes ||
          indexEntry.profileTypes.includes(profileType))
      );
    }) ?? [];

  return [
    api,
    staticSearchEntries,
    api.data?.content?.apiSearchConfigs ?? null,
  ] as const;
}

const fuseOptions = {
  threshold: 0.4,
  minMatchCharLength: 2,
  keys: ['description', 'url', { name: 'keywords', weight: 0.2 }],
};

function createFuseInstanceFromSearchEntries(
  staticSearchEntries: SearchEntry[],
  dynamicSearchEntries: SearchEntry[]
) {
  const entries = [...staticSearchEntries, ...dynamicSearchEntries].map(
    (searchEntry) => {
      if (searchEntry.url.startsWith(buurtRouteConfig.themaPage.path)) {
        return Object.assign({}, searchEntry, {
          trailingIcon: (
            <LocationIcon
              width="14"
              height="14"
              className={styles.ExternalUrl}
            />
          ),
        });
      }
      return searchEntry;
    }
  );
  return new Fuse(entries, fuseOptions);
}

export function useDynamicSearchEntries(
  remoteApiSearchConfigs: RemoteApiSearchConfigs | null
) {
  const appState = useAppStateGetter();
  const profileType = useProfileTypeValue();

  const searchEntries = remoteApiSearchConfigs
    ? generateSearchIndexPageEntries(
        profileType,
        appState,
        combineApiSearchConfigs(apiSearchConfigs, remoteApiSearchConfigs)
      )
    : [];

  return searchEntries;
}

export function useSearchIndex() {
  const isAppStateReady = useAppStateReady();
  const [api, staticSearchEntries, remoteApiSearchConfigs] =
    useSearchConfigJSON();
  const dynamicSearchEntries = useDynamicSearchEntries(remoteApiSearchConfigs); // SearchEntry voor dynamische items (API resultaten)
  const { setFuseInstance, fuseInstance, term, setTerm } = useSearchStore();

  useEffect(() => {
    if (!api.loading && !api.dirty) {
      api.fetch();
    }
    if (
      isAppStateReady &&
      staticSearchEntries.length &&
      dynamicSearchEntries.length &&
      !fuseInstance
    ) {
      console.log(dynamicSearchEntries);
      const fuseInstance = createFuseInstanceFromSearchEntries(
        staticSearchEntries,
        dynamicSearchEntries
      );
      setFuseInstance(fuseInstance);
    }
  }, [
    dynamicSearchEntries,
    staticSearchEntries,
    api.loading,
    api.dirty,
    fuseInstance,
    isAppStateReady,
  ]);

  return {
    term,
    setTerm,
    getResultsMA: () => {
      if (fuseInstance && !!term) {
        const rawResults = fuseInstance.search(term);
        return rawResults.map((result) => result.item);
      }
    },
    getResultsAM: () => {
      return [];
    },
  };
}

export function useDisplayLiveSearch() {
  const location = useLocation();
  const isSmallScreen = useSmallScreen();

  const ROUTES_EXCLUDED = [SearchPageRoute.route];

  // Only exclude livesearch on dashboard large screen
  if (!isSmallScreen) {
    ROUTES_EXCLUDED.push(DashboardRoute.route);
  }

  // Does not mach an excluded route
  const isNotExcluded = !ROUTES_EXCLUDED.some((route) =>
    matchPath(route, location.pathname)
  );
  return isNotExcluded;
}

export function useSearchOnPage(): {
  isSearchActive: boolean;
  setSearchActive: SearchTermStore['setSearchActive'];
  isDisplayLiveSearch: boolean;
} {
  const { isSearchActive, setSearchActive } = useSearchStore();
  const isDisplayLiveSearch = useDisplayLiveSearch();

  useEffect(() => {
    if (isSearchActive && isDisplayLiveSearch) {
      document.body.classList.add('is-typeAheadActive');
    } else {
      document.body.classList.remove('is-typeAheadActive');
    }
  }, [isSearchActive, isDisplayLiveSearch]);

  return {
    isSearchActive,
    setSearchActive,
    isDisplayLiveSearch,
  };
}
