import { ExternalLink } from '@amsterdam/design-system-react-icons';
import axios, { AxiosResponse } from 'axios';
import Fuse from 'fuse.js';
import { LatLngTuple } from 'leaflet';
import { useEffect, useMemo, useState } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import {
  atom,
  Loadable,
  noWait,
  selector,
  selectorFamily,
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
} from 'recoil';
import { AppRoutes } from '../../../universal/config';
import { pick, uniqueArray } from '../../../universal/helpers';
import { ApiResponse, isError } from '../../../universal/helpers/api';
import { AppState } from '../../AppState';
import { IconMarker } from '../../assets/icons';
import { BFFApiUrls } from '../../config/api';
import { addAxiosResponseTransform } from '../../hooks/api/useDataApi';
import { useAppStateGetter, useAppStateReady } from '../../hooks/useAppState';
import { useKeyUp } from '../../hooks/useKey';
import {
  useProfileTypeSwitch,
  useProfileTypeValue,
} from '../../hooks/useProfileType';
import styles from './Search.module.scss';
import {
  ApiBaseItem,
  ApiSearchConfig,
  apiSearchConfigs,
  displayPath,
  SearchConfigRemote,
  SearchEntry,
} from './searchConfig';

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
      searchEntry.keywords = [...(searchEntry.keywords || []), ...value];
    } else if (prop === 'keywordsGeneratedFromProps') {
      const generatedKeywordValues = Object.values(pick(item, value));
      searchEntry.keywords = [
        ...(searchEntry.keywords || []),
        ...generatedKeywordValues,
      ];
    } else {
      const key: keyof SearchEntry = prop;
      searchEntry[key] = value;
    }
  }

  if (searchEntry.keywords) {
    searchEntry.keywords = uniqueArray(searchEntry.keywords.filter((x) => !!x));
  }

  return searchEntry;
}

export function combineApiSearchConfigs(
  localConfigs: Array<ApiSearchConfig>,
  remoteConfigs: Record<
    keyof AppState,
    Partial<Omit<ApiSearchConfig, 'getApiBaseItems' | 'generateKeywords'>>
  >
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
      !isError(appState[apiConfig.stateKey]) &&
      !!appState[apiConfig.stateKey]?.content;
    const isEnabled =
      !!apiConfig && 'isEnabled' in apiConfig ? apiConfig.isEnabled : true;
    return (
      apiConfig.profileTypes?.includes(profileType) &&
      isEnabled &&
      hasProperAppState
    );
  });

  return apiConfigs.flatMap((apiConfig) =>
    apiConfig
      .getApiBaseItems(appState[apiConfig.stateKey].content)
      .map((item) => generateSearchIndexPageEntry(item, apiConfig))
  );
}

interface AmsterdamSearchResult {
  title: string;
  sections: string[];
  description: string;
  url: string;
  highlight: { title: string };
}

function transformSearchAmsterdamNLresponse(responseData: any): SearchEntry[] {
  if (Array.isArray(responseData?.records?.page)) {
    return responseData.records.page.map((page: AmsterdamSearchResult) => {
      return {
        displayTitle: (term: string) =>
          displayPath(term, [page.highlight.title || page.title], false),
        keywords: page.sections,
        description: page.description,
        url: page.url,
        trailingIcon: (
          <ExternalLink width="14" height="14" className={styles.ExternalUrl} />
        ),
      };
    });
  }
  return [];
}

export async function searchAmsterdamNL(
  keywords: string,
  resultCountPerPage: number = 5,
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

interface BagSearchResult {
  adres: string;
  postcode: string;
  straatnaam: string;
  huisnummer: number;
  toevoeging: string;
  woonplaats: string;
  centroid: LatLngTuple;
}

function transformSearchBagresponse(responseData: any): SearchEntry[] {
  if (Array.isArray(responseData?.results)) {
    return responseData.results.slice(0, 5).map((address: BagSearchResult) => {
      const displayTitle = `${address.adres} ${address.postcode} ${address.woonplaats}`;
      return {
        displayTitle,
        keywords: [address.adres, 'bag'],
        description: `${address.adres} ${address.postcode} ${address.woonplaats}`,
        url: `/buurt?zoom=12&centerMarker=${encodeURIComponent(
          JSON.stringify({
            latlng: { lat: address.centroid[1], lng: address.centroid[0] },
            label: displayTitle,
          })
        )}`,
        trailingIcon: (
          <IconMarker width="14" height="14" className={styles.ExternalUrl} />
        ),
      };
    });
  }

  return [];
}

async function searchBag(keywords: string) {
  if (!keywords || keywords?.length === 0) {
    return null;
  }
  const url = `https://api.data.amsterdam.nl/atlas/search/adres/?features=2&q=${keywords}`;

  const response = await axios.get<SearchEntry[]>(url, {
    transformResponse: addAxiosResponseTransform(transformSearchBagresponse),
    headers: {
      'X-Api-Key': import.meta.env.BFF_DATA_AMSTERDAM_API_KEY,
    },
  });

  return response.data;
}

const options = {
  threshold: 0.4,
  minMatchCharLength: 2,
  keys: ['description', 'url', { name: 'keywords', weight: 0.2 }],
};

export function useStaticSearchEntries() {
  const remoteSearchConfig = useRecoilValueLoadable(searchConfigRemote);
  const profileType = useProfileTypeValue();

  return useMemo(() => {
    if (
      remoteSearchConfig.state === 'hasValue' &&
      remoteSearchConfig.contents?.staticSearchEntries
    ) {
      const staticEntries: SearchEntry[] =
        remoteSearchConfig.contents.staticSearchEntries;

      return staticEntries.filter((indexEntry) => {
        const isEnabled =
          'isEnabled' in indexEntry ? indexEntry.isEnabled : true;
        return (
          isEnabled &&
          (!indexEntry.profileTypes ||
            indexEntry.profileTypes.includes(profileType))
        );
      });
    }
    return null;
  }, [profileType, remoteSearchConfig]);
}

function useDynamicSearchEntries() {
  const isAppStateReady = useAppStateReady();
  const remoteSearchConfig = useRecoilValueLoadable(searchConfigRemote);
  const appState = useAppStateGetter();
  const profileType = useProfileTypeValue();

  // Because the results of this hook could be used as deps in other hooks we need to make the results stable using useMemo.
  return useMemo(() => {
    let searchEntries = null;
    if (
      isAppStateReady &&
      remoteSearchConfig.state === 'hasValue' &&
      remoteSearchConfig.contents?.apiSearchConfigs
    ) {
      searchEntries = generateSearchIndexPageEntries(
        profileType,
        appState,
        combineApiSearchConfigs(
          apiSearchConfigs,
          remoteSearchConfig.contents.apiSearchConfigs
        )
      );
    }
    return searchEntries;
  }, [isAppStateReady, appState, profileType, remoteSearchConfig]);
}

let fuseInstance: any;
export function useSearchIndex() {
  const staticSearchEntries = useStaticSearchEntries();
  const dynamicSearchEntries = useDynamicSearchEntries();

  useEffect(() => {
    if (!!staticSearchEntries && !!dynamicSearchEntries) {
      const entries = [
        ...(staticSearchEntries || []),
        ...(dynamicSearchEntries || []),
      ].map((searchEntry) => {
        if (searchEntry.url.startsWith(AppRoutes.BUURT)) {
          return Object.assign({}, searchEntry, {
            trailingIcon: (
              <IconMarker
                width="14"
                height="14"
                className={styles.ExternalUrl}
              />
            ),
          });
        }
        return searchEntry;
      });

      fuseInstance = new Fuse(entries, options);
    }
  }, [dynamicSearchEntries, staticSearchEntries]);

  useProfileTypeSwitch(() => {
    // Reset the search index
    fuseInstance = null;
  });
}

export const searchTermAtom = atom<string>({
  key: 'searchTerm',
  default: '',
});

export function useSearchTerm() {
  return useRecoilState(searchTermAtom);
}

const amsterdamNLQuery = selectorFamily({
  key: 'amsterdamNLQuery',
  get:
    (useExtendedAmsterdamSearch: boolean) =>
    async ({ get }) => {
      const term = get(searchTermAtom);
      const response = await (term
        ? searchAmsterdamNL(term, 10, useExtendedAmsterdamSearch)
        : null);
      return response;
    },
});

export const requestID = atom<number>({
  key: 'searchTermrequestID',
  default: 0,
});

export const searchConfigRemote = selector<SearchConfigRemote | null>({
  key: 'SearchConfigRemote',
  get: async ({ get }) => {
    // Subscribe to updates from requestID to re-evaluate selector to reload the SEARCH_CONFIG
    get(requestID);
    const response: AxiosResponse<ApiResponse<SearchConfigRemote>> =
      await axios.get(BFFApiUrls.SEARCH_CONFIGURATION, {
        responseType: 'json',
        withCredentials: true,
      });

    return response.data.content;
  },
});

const bagSeachResults = selector<SearchEntry[] | null>({
  key: 'BagSearchResults',
  get: async ({ get }) => {
    const term = get(searchTermAtom);
    const response = await searchBag(term);

    if (fuseInstance && response?.length) {
      fuseInstance.remove((doc: SearchEntry) => {
        return doc.keywords.indexOf('bag') !== -1;
      });
      for (const entry of response) {
        fuseInstance.add(entry);
      }
    }

    return response;
  },
});

const mijnQuery = selector({
  key: 'mijnQuery',
  get: ({ get }) => {
    const term = get(searchTermAtom);
    get(noWait(bagSeachResults)); // Subscribes to updates from the bag results

    if (fuseInstance && !!term) {
      const rawResults = fuseInstance.search(term);
      return rawResults.map((result: any) => result.item);
    }

    return [];
  },
});

export interface SearchResults {
  ma?: SearchEntry[];
  am?: Loadable<SearchEntry[] | null>;
}

export function useSearchResults(
  useExtendedAmsterdamSearch: boolean = false
): SearchResults {
  return {
    ma: useRecoilValue(mijnQuery),
    am: useRecoilValueLoadable(amsterdamNLQuery(useExtendedAmsterdamSearch)),
  };
}

export function useSearchOnPage(): {
  isSearchActive: boolean;
  setSearchActive: React.Dispatch<React.SetStateAction<boolean>>;
  isDisplayLiveSearch: boolean;
} {
  const [isSearchActive, setSearchActive] = useState(false);
  const location = useLocation();
  const isDisplayLiveSearch = !matchPath(location.pathname, {
    path: AppRoutes.SEARCH,
  });

  useEffect(() => {
    if (isSearchActive && isDisplayLiveSearch) {
      document.body.classList.add('is-typeAheadActive');
    } else {
      document.body.classList.remove('is-typeAheadActive');
    }
  }, [isSearchActive, isDisplayLiveSearch]);

  useKeyUp((event) => {
    if (event.key === 'z' && !isSearchActive) {
      setSearchActive(true);
    }
  });

  return {
    isSearchActive,
    setSearchActive,
    isDisplayLiveSearch,
  };
}
