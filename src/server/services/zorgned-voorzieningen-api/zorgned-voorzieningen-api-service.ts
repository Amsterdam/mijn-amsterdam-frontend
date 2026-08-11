import type { Entries } from 'type-fest';

import {
  PICK_VOORZIENING_KEYS,
  jzdVoorzieningenApiConfig,
} from './api-config/jzd-api-config.ts';
import type { VoorzieningenRequestInputFilters } from './api-config/request-input.ts';
import type {
  WithMaApiProps,
  VoorzieningenApiConfig,
  ZorgnedAanvraagTransformedWithMaApiProps,
  WithMaApiPropsAssignments,
} from './zorgned-voorzieningen-api-types.ts';
import {
  apiErrorResult,
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { dateSort } from '../../../universal/helpers/date.ts';
import { entries, pick } from '../../../universal/helpers/utils.ts';
import type { ZorgnedAanvraagTransformed } from '../zorgned/zorgned-types.ts';

function isMaApiPropertyConfigMatch<T extends ZorgnedAanvraagTransformed>(
  voorziening: T,
  actionConfig: VoorzieningenApiConfig<T>,
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

  return matchers.every(([voorzieningKey, valueMatch]) => {
    if (typeof valueMatch === 'function') {
      return valueMatch(voorziening);
    }

    if (Array.isArray(valueMatch)) {
      return valueMatch.includes(voorziening[voorzieningKey]);
    }

    return voorziening[voorzieningKey] === valueMatch;
  });
}

function addMaApiPropsToVoorziening<T extends ZorgnedAanvraagTransformed>(
  apiPropsConfig: VoorzieningenApiConfig<T>[],
  voorziening: T
): T & Partial<WithMaApiProps> {
  const applyAssignments: Partial<WithMaApiProps> = {};

  apiPropsConfig.forEach((actionConfig) => {
    if (
      isMaApiPropertyConfigMatch(voorziening, actionConfig, 'include') &&
      !isMaApiPropertyConfigMatch(voorziening, actionConfig, 'exclude')
    ) {
      type _Entries = Entries<
        WithMaApiPropsAssignments<ZorgnedAanvraagTransformed>
      >;
      (Object.entries(actionConfig.assign) as _Entries).forEach(
        ([key, value]) => {
          let value_ = value;
          if (typeof value === 'function') {
            value_ = value(voorziening, key as never); // The "as never" is needed to satisfy the type checker, because the type of key is a string, but we know that it will always be a valid key of WithMaApiProps.
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

  return { ...voorziening, ...applyAssignments };
}

function serviceErrorResult(
  voorzieningenResponses: ApiResponse<ZorgnedAanvraagTransformed[]>[]
) {
  const firstErrorResponse = voorzieningenResponses.find(
    (response) => response.status === 'ERROR'
  );

  return apiErrorResult(
    'Error fetching voorzieningen',
    null,
    firstErrorResponse?.code
  );
}

export function transformVoorzieningForFrontendWithMaApiProps(
  serviceResponse: ApiResponse<ZorgnedAanvraagTransformed[]>,
  apiConfig: VoorzieningenApiConfig[],
  filters?: VoorzieningenRequestInputFilters
): ZorgnedAanvraagTransformedWithMaApiProps[] {
  const voorzieningen_ = (serviceResponse.content ?? [])
    .map((voorziening) => addMaApiPropsToVoorziening(apiConfig, voorziening))
    .filter((voorziening) => {
      // If no actions are specified in the options, we want to include all items, otherwise we filter based on the specified actions.
      if (!filters?.maActies || filters.maActies.length === 0) {
        return true;
      }

      return voorziening?.maActies?.some((action) =>
        filters.maActies?.includes(action as (typeof filters.maActies)[number])
      );
    })
    .filter((voorziening) => {
      // If no product groups are specified in the options, we want to include all items, otherwise we filter based on the specified product groups.
      if (!filters?.maProductgroep || filters.maProductgroep.length === 0) {
        return true;
      }

      return voorziening?.maProductgroep
        ? !!filters.maProductgroep?.includes(
            voorziening.maProductgroep as (typeof filters.maProductgroep)[number]
          )
        : false;
    })
    .toSorted(dateSort('datumBesluit', 'desc'));

  return voorzieningen_;
}

export function fetchMaApiVoorzieningen(
  serviceResponse: ApiResponse<ZorgnedAanvraagTransformed[]>,
  apiConfig: VoorzieningenApiConfig[],
  filters?: VoorzieningenRequestInputFilters
): ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps[]> {
  if (serviceResponse.status !== 'OK') {
    return serviceErrorResult([serviceResponse]);
  }

  const voorzieningen = transformVoorzieningForFrontendWithMaApiProps(
    serviceResponse,
    apiConfig,
    filters
  );

  return apiSuccessResult(
    voorzieningen.map((voorziening) => {
      return pick(voorziening, PICK_VOORZIENING_KEYS);
    })
  );
}

export function fetchMaApiVoorzieningById(
  voorzieningenResponses: ApiResponse<ZorgnedAanvraagTransformed[]>[],
  id: ZorgnedAanvraagTransformedWithMaApiProps['id'],
  maVoorzieningenApiConfig: VoorzieningenApiConfig[] = jzdVoorzieningenApiConfig
): ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps> {
  if (voorzieningenResponses.some((response) => response.status !== 'OK')) {
    return serviceErrorResult(voorzieningenResponses);
  }

  const responseContentCombined = voorzieningenResponses.flatMap(
    (response) => response.content ?? []
  );

  const voorziening = responseContentCombined.find(
    (voorziening) => voorziening.id === id
  );

  if (!voorziening) {
    return apiErrorResult(`No voorziening found with id ${id}`, null, 404);
  }

  return apiSuccessResult(
    pick(
      addMaApiPropsToVoorziening(maVoorzieningenApiConfig, voorziening),
      PICK_VOORZIENING_KEYS
    )
  );
}

export const forTesting = {
  isMaApiPropertyConfigMatch,
  addMaApiPropsToVoorziening,
  fetchMaApiVoorzieningById,
};
