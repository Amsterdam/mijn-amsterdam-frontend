import { useEffect } from 'react';

import {
  ExternalLinkIcon,
  LocationIcon,
} from '@amsterdam/design-system-react-icons';
import Fuse from 'fuse.js';
import { matchPath, useLocation } from 'react-router';
import { create } from 'zustand';

import {
  type ApiBaseItem,
  type ApiSearchConfig,
  type SearchEntry,
  apiSearchConfigs,
  displayPath,
  type RemoteApiSearchConfigs,
} from './search-config';
import styles from './Search.module.scss';
import {
  apiErrorResult,
  apiSuccessResult,
  isError,
} from '../../../universal/helpers/api';
import { pick, uniqueArray } from '../../../universal/helpers/utils';
import { AppState } from '../../../universal/types/App.types';
import { BFFApiUrls } from '../../config/api';
import { useBffApi } from '../../hooks/api/useBffApi';
import { useSmallScreen } from '../../hooks/media.hook';
import {
  useAppStateGetter,
  useAppStateReady,
} from '../../hooks/useAppStateRemote';
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
    const hasProperAppState =
      !isError(appState[apiConfig.stateKey]) && !!appState[apiConfig.stateKey];

    const isEnabled =
      !!apiConfig && 'isEnabled' in apiConfig ? apiConfig.isEnabled : true;

    return (
      apiConfig.profileTypes?.includes(profileType) &&
      isEnabled &&
      hasProperAppState
    );
  });

  return apiConfigs.flatMap((apiConfig) => {
    const apiContent = appState[apiConfig.stateKey]?.content;

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

interface AmsterdamNLResponseData {
  records: {
    page: AmsterdamSearchResult[];
  };
}

function transformSearchAmsterdamNLresponse(
  responseData: AmsterdamNLResponseData
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

export async function sendGetRequest(url: string | URL) {
  return fetch(url, { credentials: 'include' }).then(
    async (response: Response) => {
      return !response.ok
        ? apiErrorResult('Network response was not ok', null)
        : apiSuccessResult(
            transformSearchAmsterdamNLresponse(await response.json())
          );
    }
  );
}

function useAmsterdamNLSearchEntries(
  term: string,
  setResults: SearchTermStore['setResults'],
  isExtendedAmsterdamSearch: boolean
) {
  const url = isExtendedAmsterdamSearch
    ? `https://api.swiftype.com/api/v1/public/engines/search.json?engine_key=zw32MDuzZjzNC8VutizD&page=1&per_page=${RESULTS_PER_PAGE}&q=${term}&spelling=retry`
    : `https://api.swiftype.com/api/v1/public/engines/suggest.json?q=${term}&engine_key=zw32MDuzZjzNC8VutizD&per_page=${RESULTS_PER_PAGE}`;
  const api = useBffApi<SearchEntry[]>(url, {
    fetchImmediately: false,
    sendRequest: sendGetRequest,
  });
  const searchEntries = api.data?.content ?? null;

  useEffect(() => {
    if (term) {
      api.fetch(url);
    }
  }, [term]);

  useEffect(() => {
    if (searchEntries) {
      setResults({ am: searchEntries });
    }
  }, [searchEntries]);
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
  setResults: (results: { ma?: SearchEntry[]; am?: SearchEntry[] }) => void;
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
  setResults: (results: { ma?: SearchEntry[]; am?: SearchEntry[] }) =>
    set((state) => ({ results: { ...state.results, ...results } })),
}));

type SearchConfig = {
  staticSearchEntries: SearchEntry[];
  apiSearchConfigs: RemoteApiSearchConfigs;
};

export function useSearchConfigJSON() {
  const profileType = useProfileTypeValue();
  const api = useBffApi<SearchConfig>(BFFApiUrls.SEARCH_CONFIGURATION, {
    fetchImmediately: false,
  });
  const staticSearchEntries =
    api.data?.content?.staticSearchEntries?.filter((indexEntry) => {
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

export function useSearchIndex(extendedAMResults: boolean) {
  const isAppStateReady = useAppStateReady();
  const [{ fetch, isLoading }, staticSearchEntries, remoteApiSearchConfigs] =
    useSearchConfigJSON();
  const dynamicSearchEntries = useDynamicSearchEntries(remoteApiSearchConfigs); // SearchEntry voor dynamische items (API resultaten)
  const { setFuseInstance, fuseInstance, term, setTerm, setResults, results } =
    useSearchStore();
  useAmsterdamNLSearchEntries(term, setResults, extendedAMResults);

  useEffect(() => {
    if (
      isAppStateReady &&
      staticSearchEntries.length &&
      dynamicSearchEntries.length &&
      !fuseInstance
    ) {
      const fuseInstance = createFuseInstanceFromSearchEntries(
        staticSearchEntries,
        dynamicSearchEntries
      );
      setFuseInstance(fuseInstance);
    }
  }, [
    dynamicSearchEntries,
    staticSearchEntries,
    isLoading,
    fuseInstance,
    isAppStateReady,
    setFuseInstance,
  ]);

  useEffect(() => {
    if (fuseInstance && !!term) {
      const rawResults = fuseInstance.search(term).map((result) => result.item);
      setResults({ ma: rawResults });
    }
    if (term && !fuseInstance && !isLoading) {
      fetch();
    }
  }, [term, fetch, fuseInstance, setResults, isLoading]);

  return {
    term,
    setTerm,
    resultsMA: results.ma,
    resultsAM: results.am,
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
