import { isBefore } from 'date-fns';
import type z from 'zod';

import type { voorzieningenRequestInput } from './wmo-service-config.ts';
import {
  productGroep,
  wmoStatusLineItemsConfig,
} from './wmo-status-line-items.ts';
import type {
  ActionConfig,
  ZorgnedAanvraagTransformedWithActions,
} from './wmo-types.ts';
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

type FetchWmoVoorzieningenApiOptions = {
  maActies: z.infer<typeof voorzieningenRequestInput>['maActies'];
  maProductgroep?: z.infer<typeof voorzieningenRequestInput>['maProductgroep'];
};
const wmoActionsConfig: ActionConfig[] = [
  {
    match: {
      leveringsVorm: 'ZIN',
      isActueel: true,
      productsoortCode: ['ZIN', 'WRA', 'WRA1', 'WRA2', 'WRA3', 'WRA4', 'WRA5'],
      datumEindeLevering: null,
      datumBeginLevering: (voorziening) =>
        voorziening.datumBeginLevering
          ? isBefore(voorziening.datumBeginLevering, new Date())
          : false,
    },
    assign: {
      maActies: ['reparatieverzoek'],
      maProductgroep: [productGroep.WRA],
    },
  },
  {
    assign: {
      maCategorie: ['D-01'],
      maActies: ['stopzetten'],
    },
    match: {
      leveringsVorm: 'ZIN',
      isActueel: true,
      productsoortCode: [
        'AAN',
        'AUT',
        'GBW',
        'FIE',
        'ROL',
        'SCO',
        'OVE',
        'RWD',
        'RWT',
      ],
    },
  },
  // Make all the productgroups available for retrieval via the API, even if no specific actions are assigned to them.
  ...wmoStatusLineItemsConfig
    .filter((lineItemConfig) => {
      return lineItemConfig.isDisabled !== true;
    })
    .map((lineItemConfig) => {
      const match = {
        leveringsVorm: lineItemConfig.leveringsVorm,
        resultaat: lineItemConfig.resultaat,
        productsoortCode: lineItemConfig.productsoortCodes,
      };

      return {
        match: Object.fromEntries(
          entries(match).filter(([_, value]) => typeof value !== 'undefined')
        ) as ActionConfig['match'],
        assign: {
          maProductgroep: [lineItemConfig.productgroep],
        },
      };
    }),
] as const;

function isActionConfigMatch(
  voorziening: ZorgnedAanvraagTransformed,
  actionConfig: (typeof wmoActionsConfig)[number]
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

function addActionConfigToVoorziening(
  voorziening: ZorgnedAanvraagTransformed
): ZorgnedAanvraagTransformedWithActions {
  const updatedVoorziening: ZorgnedAanvraagTransformedWithActions = {
    ...voorziening,
  };

  wmoActionsConfig.forEach((actionConfig) => {
    if (isActionConfigMatch(voorziening, actionConfig)) {
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

export async function fetchWmoVoorzieningenCompact(
  bsn: BSN,
  options?: FetchWmoVoorzieningenApiOptions
): Promise<ApiResponse<ZorgnedAanvraagTransformed[]>> {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(bsn);

  if (voorzieningenResponse.status === 'OK') {
    const voorzieningen = voorzieningenResponse.content
      .map((voorziening) => {
        return addActionConfigToVoorziening(voorziening);
      })
      .filter((voorziening) => {
        // If no actions are specified in the options, we want to include all items, otherwise we filter based on the specified actions.
        if (!options?.maActies || options.maActies.length === 0) {
          return true;
        }

        return voorziening?.maActies?.some((action) =>
          options.maActies?.includes(action)
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
    ] as (keyof ZorgnedAanvraagTransformedWithActions)[];

    return apiSuccessResult(
      voorzieningen.map((voorziening) => {
        return pick(voorziening, keys);
      })
    );
  }

  return voorzieningenResponse;
}
