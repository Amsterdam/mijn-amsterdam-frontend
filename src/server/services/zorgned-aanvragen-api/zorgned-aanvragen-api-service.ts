import type { Entries } from 'type-fest';

import {
  PICK_VOORZIENING_KEYS,
  jzdAanvragenApiConfig,
} from './api-config/jzd-api-config.ts';
import type { AanvragenRequestInputFilters } from './api-config/request-input.ts';
import type {
  WithMaApiProps,
  AanvragenApiConfig,
  ZorgnedAanvraagTransformedWithMaApiProps,
  WithMaApiPropsAssignments,
} from './zorgned-aanvragen-api-types.ts';
import {
  apiErrorResult,
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { dateSort } from '../../../universal/helpers/date.ts';
import { entries, pick } from '../../../universal/helpers/utils.ts';
import type { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';

function isMaApiPropertyConfigMatch<T extends ZorgnedAanvraagTransformed>(
  aanvraag: T,
  actionConfig: AanvragenApiConfig<T>,
  matchType: 'include' | 'exclude' = 'include'
): boolean {
  const IS_DEFAULT_MATCH = matchType !== 'exclude'; // If there are no matchers, we don't want to exclude any items, but we do want to include all items.
  const matchConfig = actionConfig[matchType];

  if (!matchConfig) {
    return IS_DEFAULT_MATCH;
  }

  const matchers = entries(matchConfig);

  if (!matchers.length) {
    return IS_DEFAULT_MATCH;
  }

  const isMatch = matchers.every(([aanvraagKey, valueMatch]) => {
    if (typeof valueMatch === 'function') {
      return valueMatch(aanvraag);
    }

    if (Array.isArray(valueMatch)) {
      return valueMatch.includes(aanvraag[aanvraagKey]);
    }

    return aanvraag[aanvraagKey] === valueMatch;
  });

  return isMatch;
}

function addMaApiPropsToAanvraag<T extends ZorgnedAanvraagTransformed>(
  apiConfig: AanvragenApiConfig<T>[],
  aanvraag: T
): T & Partial<WithMaApiProps> {
  const applyAssignments: Partial<WithMaApiProps> = {};

  apiConfig.forEach((actionConfig) => {
    const isMatchedForInclusion = isMaApiPropertyConfigMatch(
      aanvraag,
      actionConfig,
      'include'
    );

    const isMatchedForExclusion = isMaApiPropertyConfigMatch(
      aanvraag,
      actionConfig,
      'exclude'
    );

    if (isMatchedForInclusion && !isMatchedForExclusion) {
      type _Entries = Entries<
        WithMaApiPropsAssignments<ZorgnedAanvraagTransformed>
      >;
      (Object.entries(actionConfig.assign) as _Entries).forEach(
        ([key, value]) => {
          let value_ = value;
          if (typeof value === 'function') {
            value_ = value(aanvraag, key as never); // The "as never" is needed to satisfy the type checker, because the type of key is a string, but we know that it will always be a valid key of WithMaApiProps.
          }
          if (Array.isArray(value_)) {
            // Merge and deduplicate array values if the key already exists in the new assignments, otherwise just assign the value.
            const existingValue = (applyAssignments[key] ?? []) as string[];
            (applyAssignments[key] as string[]) = [
              ...existingValue,
              ...value_,
            ].filter((v, i, arr) => arr.indexOf(v) === i);
          } else if (value_ !== undefined && typeof value_ !== 'function') {
            (applyAssignments[key] as string | Record<string, string>) = value_;
          }
        }
      );
    }
  });

  return { ...aanvraag, ...applyAssignments };
}

function serviceErrorResult(
  aanvragenResponses: ApiResponse<ZorgnedAanvraagTransformed[]>[]
) {
  const firstErrorResponse = aanvragenResponses.find(
    (response) => response.status === 'ERROR'
  );

  return apiErrorResult(
    'Error fetching aanvragen',
    null,
    firstErrorResponse?.code
  );
}

export function transformAanvraagForFrontendWithMaApiProps(
  serviceResponse: ApiResponse<ZorgnedAanvraagTransformed[]>,
  apiConfig: AanvragenApiConfig[],
  filters?: AanvragenRequestInputFilters
): ZorgnedAanvraagTransformedWithMaApiProps[] {
  const aanvragen_ = (serviceResponse.content ?? [])
    .map((aanvraag) => addMaApiPropsToAanvraag(apiConfig, aanvraag))
    .filter((aanvraag) => {
      // If no actions are specified in the options, we want to include all items, otherwise we filter based on the specified actions.
      if (!filters?.maActies || filters.maActies.length === 0) {
        return true;
      }

      return aanvraag?.maActies?.some((action: string) =>
        filters.maActies?.includes(action as (typeof filters.maActies)[number])
      );
    })
    .filter((aanvraag) => {
      // If no product groups are specified in the options, we want to include all items, otherwise we filter based on the specified product groups.
      if (!filters?.maProductgroep || filters.maProductgroep.length === 0) {
        return true;
      }

      return aanvraag?.maProductgroep
        ? !!filters.maProductgroep?.includes(
            aanvraag.maProductgroep as (typeof filters.maProductgroep)[number]
          )
        : false;
    })
    .toSorted(dateSort('datumBesluit', 'desc'));

  return aanvragen_;
}

export function fetchMaApiAanvragen(
  serviceResponse: ApiResponse<ZorgnedAanvraagTransformed[]>,
  apiConfig: AanvragenApiConfig[],
  filters?: AanvragenRequestInputFilters
): ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps[]> {
  if (serviceResponse.status !== 'OK') {
    return serviceErrorResult([serviceResponse]);
  }

  const aanvragen = transformAanvraagForFrontendWithMaApiProps(
    serviceResponse,
    apiConfig,
    filters
  );

  return apiSuccessResult(
    aanvragen.map((aanvraag) => {
      return pick(aanvraag, PICK_VOORZIENING_KEYS);
    })
  );
}

export function fetchMaApiAanvraagById(
  aanvragenResponses: ApiResponse<ZorgnedAanvraagTransformed[]>[],
  id: ZorgnedAanvraagTransformedWithMaApiProps['id'],
  maAanvragenApiConfig: AanvragenApiConfig[] = jzdAanvragenApiConfig
): ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps> {
  if (aanvragenResponses.some((response) => response.status !== 'OK')) {
    return serviceErrorResult(aanvragenResponses);
  }

  const responseContentCombined = aanvragenResponses.flatMap(
    (response) => response.content ?? []
  );

  const aanvraag = responseContentCombined.find(
    (aanvraag) => aanvraag.id === id
  );

  if (!aanvraag) {
    return apiErrorResult(`No aanvraag found with id ${id}`, null, 404);
  }

  return apiSuccessResult(
    pick(
      addMaApiPropsToAanvraag(maAanvragenApiConfig, aanvraag),
      PICK_VOORZIENING_KEYS
    )
  );
}

export const forTesting = {
  isMaApiPropertyConfigMatch,
  addMaApiPropsToAanvraag,
  fetchMaApiAanvraagById,
};
