import type { Entries } from 'type-fest';

import { fetchZorgnedAanvragenJeugd } from './jeugd/jeugd.ts';
import type {
  WithMaApiProps,
  JzdApiConfig,
  ZorgnedAanvraagTransformedWithMaApiProps,
  WithMaApiPropsAssignments,
} from './jzd-types.ts';
import { type FetchWmoVoorzieningenApiOptions } from './jzd-voorzieningen-api-config.ts';
import {
  PICK_VOORZIENING_KEYS,
  wmoVoorzieningenApiConfig,
} from './jzd-voorzieningen-api-config.ts';
import { fetchZorgnedAanvragenWMO } from './wmo/wmo-zorgned-service.ts';
import {
  apiErrorResult,
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { dateSort } from '../../../universal/helpers/date.ts';
import { entries, pick } from '../../../universal/helpers/utils.ts';
import type {
  BSN,
  ZorgnedAanvraagTransformed,
} from '../zorgned/zorgned-types.ts';

function isMaApiPropertyConfigMatch<T extends object>(
  voorziening: T,
  actionConfig: JzdApiConfig<T>
): boolean {
  const matchers = entries(actionConfig.match);

  return matchers.every(([key, value]) => {
    if (typeof value === 'function') {
      return value(voorziening);
    }

    if (Array.isArray(value)) {
      return value.includes(voorziening[key]);
    }

    return voorziening[key] === value;
  });
}

function addMaApiPropsToVoorziening<T extends ZorgnedAanvraagTransformed>(
  apiPropsConfig: JzdApiConfig<T>[],
  voorziening: T
): T & Partial<WithMaApiProps> {
  const applyAssignments: Partial<WithMaApiProps> = {};

  apiPropsConfig.forEach((actionConfig) => {
    if (isMaApiPropertyConfigMatch(voorziening, actionConfig)) {
      (
        Object.entries(actionConfig.assign) as Entries<
          WithMaApiPropsAssignments<ZorgnedAanvraagTransformed>
        >
      ).forEach(([key, value]) => {
        let value_ = value;
        if (typeof value == 'function') {
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
      });
    }
  });

  return { ...voorziening, ...applyAssignments };
}

function serviceErrorResult(
  wmoVoorzieningenResponse: ApiResponse<ZorgnedAanvraagTransformed[]>,
  jeugdVoorzieningenResponse: ApiResponse<ZorgnedAanvraagTransformed[]>
) {
  return apiErrorResult(
    'Error fetching voorzieningen',
    null,
    wmoVoorzieningenResponse.status === 'ERROR'
      ? wmoVoorzieningenResponse.code
      : jeugdVoorzieningenResponse.status === 'ERROR'
        ? jeugdVoorzieningenResponse.code
        : undefined
  );
}

export async function fetchMaApiVoorzieningen(
  bsn: BSN,
  options?: FetchWmoVoorzieningenApiOptions,
  maVoorzieningenApiConfig: JzdApiConfig[] = wmoVoorzieningenApiConfig
): Promise<ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps[]>> {
  const wmoVoorzieningenResponse = await fetchZorgnedAanvragenWMO(bsn);
  const jeugdVoorzieningenResponse = await fetchZorgnedAanvragenJeugd(bsn);

  if (
    wmoVoorzieningenResponse.status !== 'OK' ||
    jeugdVoorzieningenResponse.status !== 'OK'
  ) {
    return serviceErrorResult(
      wmoVoorzieningenResponse,
      jeugdVoorzieningenResponse
    );
  }

  const responseContentCombined = [
    ...(wmoVoorzieningenResponse.content ?? []),
    ...(jeugdVoorzieningenResponse.content ?? []),
  ];

  const voorzieningen = responseContentCombined
    .map((voorziening) => {
      return addMaApiPropsToVoorziening(maVoorzieningenApiConfig, voorziening);
    })
    .filter((voorziening) => {
      // If no actions are specified in the options, we want to include all items, otherwise we filter based on the specified actions.
      if (!options?.maActies || options.maActies.length === 0) {
        return true;
      }

      return voorziening?.maActies?.some((action) =>
        options.maActies?.includes(action as (typeof options.maActies)[number])
      );
    })
    .filter((voorziening) => {
      // If no product groups are specified in the options, we want to include all items, otherwise we filter based on the specified product groups.
      if (!options?.maProductgroep || options.maProductgroep.length === 0) {
        return true;
      }

      return voorziening?.maProductgroep?.some((productgroep) =>
        options.maProductgroep?.includes(
          productgroep as (typeof options.maProductgroep)[number]
        )
      );
    })
    .toSorted(dateSort('datumBesluit', 'desc'));

  return apiSuccessResult(
    voorzieningen.map((voorziening) => {
      return pick(voorziening, PICK_VOORZIENING_KEYS);
    })
  );
}

export async function fetchMaApiVoorzieningById(
  bsn: BSN,
  id: ZorgnedAanvraagTransformedWithMaApiProps['id'],
  maVoorzieningenApiConfig: JzdApiConfig[] = wmoVoorzieningenApiConfig
): Promise<ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps>> {
  const wmoVoorzieningenResponse = await fetchZorgnedAanvragenWMO(bsn);
  const jeugdVoorzieningenResponse = await fetchZorgnedAanvragenJeugd(bsn);

  if (
    wmoVoorzieningenResponse.status !== 'OK' ||
    jeugdVoorzieningenResponse.status !== 'OK'
  ) {
    return serviceErrorResult(
      wmoVoorzieningenResponse,
      jeugdVoorzieningenResponse
    );
  }

  const responseContentCombined = [
    ...(wmoVoorzieningenResponse.content ?? []),
    ...(jeugdVoorzieningenResponse.content ?? []),
  ];

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
