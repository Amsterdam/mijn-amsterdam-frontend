import type {
  WithMaApiProps,
  WmoAapiConfig,
  ZorgnedAanvraagTransformedWithMaApiProps,
} from './wmo-types.ts';
import { wmoVoorzieningenApiConfig } from './wmo-voorzieningen-api-config.ts';
import { type FetchWmoVoorzieningenApiOptions } from './wmo-voorzieningen-api-config.ts';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service.ts';
import {
  type ApiResponse,
  apiSuccessResult,
} from '../../../universal/helpers/api.ts';
import { dateSort } from '../../../universal/helpers/date.ts';
import { entries, pick } from '../../../universal/helpers/utils.ts';
import type {
  ZorgnedAanvraagTransformed,
  BSN,
} from '../zorgned/zorgned-types.ts';

function isMaApiPropertyConfigMatch<T extends object>(
  voorziening: T,
  actionConfig: WmoAapiConfig<T>
): boolean {
  const matchers = entries(actionConfig.match);

  return matchers.every(([key, value]) => {
    if (typeof value === 'function') {
      return value(voorziening);
    }

    if (Array.isArray(value)) {
      return value.includes(
        key === 'leveringsVorm' ? (voorziening[key] ?? '') : voorziening[key]
      ); // Null values are matched as empty strings for Leveringsvorm.
    }

    return voorziening[key] === value;
  });
}

function addMaApiPropsToVoorziening<T extends object>(
  apiPropsConfig: WmoAapiConfig<T>[],
  voorziening: T
): T & Partial<WithMaApiProps> {
  const updatedVoorziening: T & Partial<WithMaApiProps> = {
    ...voorziening,
  };

  apiPropsConfig.forEach((actionConfig) => {
    if (isMaApiPropertyConfigMatch(voorziening, actionConfig)) {
      entries(actionConfig.assign).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          // Merge and deduplicate array values if the key already exists in the voorziening, otherwise just assign the value.
          updatedVoorziening[key] = [
            ...(updatedVoorziening[key] ?? []),
            ...value,
          ].filter((v, i, arr) => arr.indexOf(v) === i);
        } else if (value !== undefined) {
          updatedVoorziening[key] = value;
        }
      });
    }
  });

  return updatedVoorziening;
}

export async function fetchMaApiVoorzieningen(
  bsn: BSN,
  options?: FetchWmoVoorzieningenApiOptions,
  maVoorzieningenApiConfig: WmoAapiConfig[] = wmoVoorzieningenApiConfig
): Promise<ApiResponse<ZorgnedAanvraagTransformed[]>> {
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

    const keys = [
      'id',
      'titel',
      'procesIdentificatie',
      'beschikkingNummer',
      'productIdentificatie',
      'productsoortCode',
      'beschiktProductIdentificatie',
      'datumAanvraag',
      'datumBesluit',
      'datumBeginLevering',
      'datumEindeLevering',
      'datumIngangGeldigheid',
      'datumEindeGeldigheid',
      'datumOpdrachtLevering',
      'leverancier',
      'leverancierIdentificatie',
      'leveringsVorm',
      'resultaat',
      'maActies',
      'maCategorie',
      'maProductgroep',
    ] as (keyof ZorgnedAanvraagTransformedWithMaApiProps)[];

    return apiSuccessResult(
      voorzieningen.map((voorziening) => {
        return pick(voorziening, keys);
      })
    );
  }

  return voorzieningenResponse;
}

export const forTesting = {
  isMaApiPropertyConfigMatch,
  addMaApiPropsToVoorziening,
};
