import axios from 'axios';
import Fuse from 'fuse.js';
import { useEffect } from 'react';
import {
  atom,
  Loadable,
  selector,
  useRecoilState,
  useRecoilValue,
  useRecoilValueLoadable,
} from 'recoil';
import { pick, uniqueArray } from '../../../universal/helpers';
import { ApiSuccessResponse, isError } from '../../../universal/helpers/api';
import { AppState, PRISTINE_APPSTATE } from '../../AppState';
import { addAxiosResponseTransform } from '../../hooks/api/useDataApi';
import { useAppStateGetter } from '../../hooks/useAppState';
import {
  ApiBaseItem,
  ApiSearchConfig,
  apiSearchConfigs,
  API_SEARCH_CONFIG_DEFAULT,
  displayPath,
  PageEntry,
  searchStateKeys,
  staticIndex,
} from './searchConfig';

export const dynamicSearchIndex: PageEntry[] = [...staticIndex];

export function generateSearchIndexPageEntry(
  item: ApiBaseItem,
  apiConfig: ApiSearchConfig
): PageEntry {
  const props: Array<
    Exclude<keyof ApiSearchConfig, 'getApiBaseItems' | 'apiName'>
  > = [
    'keywordSourceProps',
    'title',
    'displayTitle',
    'description',
    'url',
    'keywords',
  ];

  const pageEntry = {} as PageEntry;

  for (const prop of props) {
    const configValue = apiConfig[prop];

    let value =
      typeof configValue === 'function'
        ? configValue(item, apiConfig)
        : configValue;

    if (prop === 'keywords') {
      pageEntry.keywords = uniqueArray([
        ...(pageEntry.keywords || []),
        ...value,
      ]);
    } else if (prop === 'keywordSourceProps') {
      value = Object.values(pick(item, value));
      pageEntry.keywords = uniqueArray([
        ...(pageEntry.keywords || []),
        ...value,
      ]);
    } else {
      pageEntry[prop as keyof PageEntry] = value;
    }
  }

  return pageEntry;
}

export function generateSearchIndexPageEntries(
  apiName: string,
  apiContent: ApiSuccessResponse<any>['content']
): PageEntry[] {
  const config = apiSearchConfigs.find((config) => config.apiName === apiName);

  if (!config) {
    throw new Error(`${apiName} does not have search index entry.`);
  }

  const apiConfig: ApiSearchConfig = {
    ...API_SEARCH_CONFIG_DEFAULT,
    ...config,
  };

  return apiConfig
    .getApiBaseItems(apiContent)
    .map((item) => generateSearchIndexPageEntry(item, apiConfig));
}

interface AmsterdamSearchResult {
  title: string;
  sections: string[];
  description: string;
  url: string;
}

function transformSearchAmsterdamNLresponse(responseData: any): PageEntry[] {
  if (Array.isArray(responseData?.records?.page)) {
    return responseData.records.page.map((page: AmsterdamSearchResult) => {
      return {
        title: page.title,
        displayTitle: displayPath([page.title], true),
        keywords: page.sections,
        description: page.description,
        url: page.url,
      };
    });
  }
  return [];
}

export async function searchAmsterdamNL(
  keywords: string,
  resultCountPerPage: number = 5
) {
  const response = await axios.get<PageEntry[]>(
    `https://api.swiftype.com/api/v1/public/engines/suggest.json?q=${keywords}&engine_key=zw32MDuzZjzNC8VutizD&per_page=${resultCountPerPage}`,
    {
      transformResponse: addAxiosResponseTransform(
        transformSearchAmsterdamNLresponse
      ),
    }
  );

  return response.data;
}

const options = {
  threshold: 0.2,
  includeScore: true,
  minMatchCharLength: 3,
  keys: ['title', 'description', 'keywords'],
};

export const searchConfigAtom = atom<{
  index: Fuse<PageEntry> | null;
  apiNames: Array<keyof Partial<AppState>>;
}>({
  key: 'searchConfigState',
  default: {
    index: null,
    apiNames: [],
  },
});

export function useSearch() {
  return useRecoilState(searchConfigAtom);
}

export function isIndexReady(apiNames: Array<keyof AppState>) {
  return searchStateKeys.every((apiName) => apiNames.includes(apiName));
}

export function useSearchIndex() {
  const [{ index, apiNames }, setSearchConfig] = useSearch();
  const appState = useAppStateGetter();

  const isAppStateReady = searchStateKeys.every((stateKey) => {
    return appState[stateKey] !== PRISTINE_APPSTATE[stateKey];
  });

  const isIndexed = isIndexReady(apiNames);

  useEffect(() => {
    if (isAppStateReady && !isIndexed) {
      const sindex = index || new Fuse(staticIndex, options);
      const sApiNames: Array<keyof AppState> = [];

      for (const stateKey of searchStateKeys) {
        if (!isError(appState[stateKey])) {
          const pageEntries = generateSearchIndexPageEntries(
            stateKey,
            appState[stateKey].content
          );
          for (const entry of pageEntries) {
            sindex.add(entry);
          }
        }
        sApiNames.push(stateKey);
      }

      setSearchConfig(() => ({
        index: sindex,
        apiNames: sApiNames,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAppStateReady, isIndexed]);

  return isAppStateReady && isIndexReady(apiNames);
}

export const searchTermAtom = atom<string>({
  key: 'searchTerm',
  default: '',
});

export function useSearchTerm() {
  return useRecoilState(searchTermAtom);
}

const amsterdamNLQuery = selector({
  key: 'amsterdamNLQuery',
  get: async ({ get }) => {
    const term = get(searchTermAtom);
    const response = term ? await searchAmsterdamNL(term) : [];
    return response;
  },
});

const isIndexReadyQuery = selector({
  key: 'isIndexReady',
  get: ({ get }) => {
    const fuse = get(searchConfigAtom);
    return isIndexReady(fuse.apiNames);
  },
});

const mijnQuery = selector({
  key: 'mijnQuery',
  get: ({ get }) => {
    const term = get(searchTermAtom);
    const fuse = get(searchConfigAtom);
    const indexReady = get(isIndexReadyQuery);

    if (indexReady && fuse.index !== null && !!term) {
      const rawResults = fuse.index.search(term);
      return rawResults.map((result) => result.item);
    }

    return [];
  },
});

export interface SearchResults {
  ma?: PageEntry[];
  am?: Loadable<PageEntry[]>;
  isIndexReady: boolean;
}

export function useSearchResults(): SearchResults {
  return {
    isIndexReady: useRecoilValue(isIndexReadyQuery),
    ma: useRecoilValue(mijnQuery),
    am: useRecoilValueLoadable(amsterdamNLQuery),
  };
}
