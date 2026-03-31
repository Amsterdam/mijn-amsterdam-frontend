import type {
  WithMaApiProps,
  WmoApiConfig,
  ZorgnedAanvraagTransformedWithMaApiProps,
} from './wmo-types.ts';
import {
  PICK_VOORZIENING_KEYS,
  wmoVoorzieningenApiConfig,
} from './wmo-voorzieningen-api-config.ts';
import { type FetchWmoVoorzieningenApiOptions } from './wmo-voorzieningen-api-config.ts';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service.ts';
import {
  apiErrorResult,
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { dateSort } from '../../../universal/helpers/date.ts';
import { entries, pick } from '../../../universal/helpers/utils.ts';
import type { BSN } from '../zorgned/zorgned-types.ts';

function isMaApiPropertyConfigMatch<T extends object>(
  voorziening: T,
  actionConfig: WmoApiConfig<T>
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

function addMaApiPropsToVoorziening<T extends object>(
  apiPropsConfig: WmoApiConfig<T>[],
  voorziening: T
): T & Partial<WithMaApiProps> {
  const applyAssignments: Partial<WithMaApiProps> = {};

  apiPropsConfig.forEach((actionConfig) => {
    if (isMaApiPropertyConfigMatch(voorziening, actionConfig)) {
      entries(actionConfig.assign).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Merge and deduplicate array values if the key already exists in the new assignments, otherwise just assign the value.
          applyAssignments[key] = [
            ...(applyAssignments[key] ?? []),
            ...value,
          ].filter((v, i, arr) => arr.indexOf(v) === i);
        } else if (value !== undefined) {
          applyAssignments[key] = value;
        }
      });
    }
  });

  return { ...voorziening, ...applyAssignments };
}

export async function fetchMaApiVoorzieningen(
  bsn: BSN,
  options?: FetchWmoVoorzieningenApiOptions,
  maVoorzieningenApiConfig: WmoApiConfig[] = wmoVoorzieningenApiConfig
): Promise<ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps[]>> {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(bsn);

  if (voorzieningenResponse.status === 'OK') {
    const voorzieningen = voorzieningenResponse.content
      .map((voorziening) => {
        return addMaApiPropsToVoorziening(
          maVoorzieningenApiConfig,
          voorziening
        );
      })
      .filter((voorziening) => {
        // If no actions are specified in the options, we want to include all items, otherwise we filter based on the specified actions.
        if (!options?.maActies || options.maActies.length === 0) {
          return true;
        }

        return voorziening?.maActies?.some((action) =>
          options.maActies?.includes(
            action as (typeof options.maActies)[number]
          )
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

  return voorzieningenResponse;
}

export async function fetchMaApiVoorzieningById(
  bsn: BSN,
  id: ZorgnedAanvraagTransformedWithMaApiProps['id'],
  maVoorzieningenApiConfig: WmoApiConfig[] = wmoVoorzieningenApiConfig
): Promise<ApiResponse<ZorgnedAanvraagTransformedWithMaApiProps>> {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(bsn);

  if (voorzieningenResponse.status === 'OK') {
    const voorzieningen = voorzieningenResponse.content
      .filter((voorziening) => voorziening.id === id)
      .map((voorziening) => {
        return addMaApiPropsToVoorziening(
          maVoorzieningenApiConfig,
          voorziening
        );
      })
      .map((voorziening) => {
        return pick(voorziening, PICK_VOORZIENING_KEYS);
      });

    if (voorzieningen.length === 0) {
      return apiErrorResult(`No voorziening found with id ${id}`, null, 404);
    }

    return apiSuccessResult(voorzieningen[0]);
  }

  return voorzieningenResponse;
}

export const forTesting = {
  isMaApiPropertyConfigMatch,
  addMaApiPropsToVoorziening,
  fetchMaApiVoorzieningById,
};
