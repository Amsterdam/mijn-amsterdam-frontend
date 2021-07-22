import axios, { CancelTokenSource } from 'axios';
import Fuse from 'fuse.js';
import { useRef } from 'react';
import { atom, useRecoilValue } from 'recoil';
import { pick } from '../../../universal/helpers';
import { addAxiosResponseTransform } from '../../hooks/api/useDataApi';
import { displayPath } from './searchConfig';
import {
  ApiBaseItem,
  ApiSearchConfig,
  apiSearchConfigs,
  API_SEARCH_CONFIG_DEFAULT,
  PageEntry,
  staticIndex,
} from './searchConfig';

export const dynamicSearchIndex: PageEntry[] = [...staticIndex];

export function generateSearchIndexPageEntry(
  item: ApiBaseItem,
  config: Partial<ApiSearchConfig>
): PageEntry {
  const apiConfig: ApiSearchConfig = {
    ...API_SEARCH_CONFIG_DEFAULT,
    ...config,
  };

  const props: Array<keyof ApiSearchConfig> = [
    'keywordSourceProps',
    'title',
    'displayTitle',
    'description',
    'url',
  ];

  const pageEntry = {} as PageEntry;

  for (const prop of props) {
    const configValue = apiConfig[prop];

    let value =
      typeof configValue === 'function'
        ? configValue(item, apiConfig)
        : configValue;

    if (prop === 'keywordSourceProps') {
      value = Object.values(pick(item, value));
      pageEntry.keywords = value;
    } else {
      pageEntry[prop as keyof PageEntry] = value;
    }
  }

  return pageEntry;
}

export function generateSearchIndexPageEntries(
  apiName: string,
  data: ApiBaseItem | ApiBaseItem[]
): PageEntry[] {
  const config = apiSearchConfigs.find((config) => config.apiName === apiName);

  if (!config) {
    throw new Error(`${apiName} does not have search index entry.`);
  }

  if (Array.isArray(data)) {
    return data.map((item) => generateSearchIndexPageEntry(item, config));
  }

  return [generateSearchIndexPageEntry(data, config)];
}

export function addItemsToSearchIndex(
  apiName: string,
  data: ApiBaseItem | ApiBaseItem[]
): void {
  const pageEntries = generateSearchIndexPageEntries(apiName, data);
  // TODO: Check of data has already been added
  console.info(
    `Added ${pageEntries.length} ${apiName} items to the search index.`
  );
  dynamicSearchIndex.push(...pageEntries);
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
