import axios, { CancelTokenSource } from 'axios';
import Fuse from 'fuse.js';
import { useRef } from 'react';
import { Vergunning } from '../../../server/services';
import { pick } from '../../../universal/helpers';
import { addAxiosResponseTransform } from '../../hooks/api/useDataApi';
import { PageEntry, staticIndex } from './staticIndex';

export const dynamicSearchIndex: PageEntry[] = [...staticIndex];

interface ApiSearchConfig {
  keywordSourceProps:
    | string[]
    | ((item: any, config: ApiSearchConfig) => string[]);
  description: string | ((item: any, config: ApiSearchConfig) => string);
  title: string | ((item: any, config: ApiSearchConfig) => string);
  url: string | ((item: any, config: ApiSearchConfig) => string);
}

export const apiSearchConfigs: Record<string, ApiSearchConfig> = {
  VERGUNNINGEN: {
    keywordSourceProps: (vergunning: Vergunning): string[] => {
      const props = ['caseType', 'title', 'status', 'decision'];
      switch (vergunning.caseType) {
        case 'Evenement melding':
          return props.concat(['eventType', 'activities', 'location']);
        default:
          return props;
      }
    },
    title: (vergunning: Vergunning) => {
      return vergunning.link.title;
    },
    url: (vergunning: Vergunning) => {
      return vergunning.link.to;
    },
    description: (vergunning: Vergunning) => {
      return `Bekijk uw aanvraag ${vergunning.caseType} met gemeentelijk zaaknummer ${vergunning.identifier}`;
    },
  },
};

export function generateSearchIndexPageEntry(
  item: any,
  config: ApiSearchConfig
) {
  const keywordSourceProps =
    typeof config.keywordSourceProps === 'function'
      ? config.keywordSourceProps(item, config)
      : config.keywordSourceProps;
  const title =
    typeof config.title === 'function'
      ? config.title(item, config)
      : config.title;
  const description =
    typeof config.description === 'function'
      ? config.description(item, config)
      : config.description;
  const url =
    typeof config.url === 'function' ? config.url(item, config) : config.url;

  return {
    keywords: Object.values(pick(item, keywordSourceProps)),
    title,
    description,
    url,
  };
}

export function generateSearchIndexPageEntries(
  apiName: string,
  data: any
): PageEntry[] {
  const config = apiSearchConfigs[apiName];

  if (Array.isArray(data)) {
    return data.map((item) => {
      return generateSearchIndexPageEntry(item, config);
    });
  }

  return [generateSearchIndexPageEntry(data, config)];
}

export function addItemsToSearchIndex(apiName: string, data: any): void {
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

export function useSearch() {
  return useRef(new Fuse(staticIndex, options));
}
