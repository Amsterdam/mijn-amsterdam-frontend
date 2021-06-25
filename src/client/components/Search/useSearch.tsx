import axios, { CancelTokenSource } from 'axios';
import Fuse from 'fuse.js';
import { atom, useRecoilState, useRecoilValue } from 'recoil';
import { pick, uniqueArray } from '../../../universal/helpers';
import { ApiSuccessResponse } from '../../../universal/helpers/api';
import { addAxiosResponseTransform } from '../../hooks/api/useDataApi';
import {
  ApiBaseItem,
  ApiSearchConfig,
  apiSearchConfigs,
  API_SEARCH_CONFIG_DEFAULT,
  displayPath,
  PageEntry,
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

let activeSource: CancelTokenSource;

function transformSearchAmsterdamNLresponse(responseData: any) {
  if (Array.isArray(responseData?.records?.page)) {
    return responseData.records.page.map((page: AmsterdamSearchResult) => {
      return {
        title: page.title,
        displayTitle: displayPath([page.title]),
        keywords: page.sections,
        description: page.description,
        url: page.url,
      };
    });
  }
  return [];
}

export function searchAmsterdamNL(
  keywords: string,
  resultCountPerPage: number = 5
) {
  if (activeSource) {
    activeSource.cancel('Search renewed');
  }

  activeSource = axios.CancelToken.source();

  return axios.get(
    `https://api.swiftype.com/api/v1/public/engines/suggest.json?q=${keywords}&engine_key=zw32MDuzZjzNC8VutizD&per_page=${resultCountPerPage}`,
    {
      cancelToken: activeSource.token,
      transformResponse: addAxiosResponseTransform(
        transformSearchAmsterdamNLresponse
      ),
    }
  );
}

const options = {
  threshold: 0.4,
  includeScore: true,
  keys: ['title', 'description', 'keywords'],
};

export const searchConfigAtom = atom<{
  index: Fuse<PageEntry>;
  apiNames: string[];
}>({
  key: 'searchConfigState',
  default: {
    index: new Fuse(staticIndex, options),
    apiNames: [],
  },
});

export function useSearch() {
  return useRecoilValue(searchConfigAtom);
}

export interface SearchResults {
  ma?: PageEntry[];
  am?: PageEntry[];
}

export const searchResultsAtom = atom<SearchResults | null>({
  key: 'searchResults',
  default: null,
});

export function useSearchResults() {
  return useRecoilState(searchResultsAtom);
}
