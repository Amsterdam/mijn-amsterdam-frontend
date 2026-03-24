import { isBefore } from 'date-fns';
import { generatePath } from 'react-router';
import type z from 'zod';

import {
  getHulpmiddelenDisclaimer,
  hulpmiddelenDisclaimerConfig as hulpmiddelenDisclaimerConfig,
} from './status-line-items/wmo-hulpmiddelen.ts';
import {
  routes,
  type voorzieningenRequestInput,
} from './wmo-service-config.ts';
import {
  productGroep,
  wmoStatusLineItemsConfig,
} from './wmo-status-line-items.ts';
import { themaConfig } from '../../../client/pages/Thema/Zorg/Zorg-thema-config.ts';
import { FeatureToggle } from '../../../universal/config/feature-toggles.ts';
import {
  apiSuccessResult,
  type ApiResponse,
} from '../../../universal/helpers/api.ts';
import {
  dateSort,
  defaultDateFormat,
} from '../../../universal/helpers/date.ts';
import { capitalizeFirstLetter } from '../../../universal/helpers/text.ts';
import { entries, pick } from '../../../universal/helpers/utils.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';
import type { AuthProfileAndToken } from '../../auth/auth-types.ts';
import { encryptSessionIdWithRouteIdParam } from '../../helpers/encrypt-decrypt.ts';
import { generateFullApiUrlBFF } from '../../routing/route-helpers.ts';
import {
  type BSN,
  type ZorgnedAanvraagTransformed,
  type ZorgnedStatusLineItemsConfig,
} from '../zorgned/zorgned-types.ts';
import {
  hasDecision,
  isAfterWCAGValidDocumentsDate,
} from './status-line-items/wmo-generic.ts';
import {
  type ActionConfig,
  type WMOVoorzieningFrontend,
  type ZorgnedAanvraagTransformedWithActions,
} from './wmo-types.ts';
import { fetchZorgnedAanvragenWMO } from './wmo-zorgned-service.ts';
import { getLatestStatus, getLatestStatusDate } from '../../helpers/zaken.ts';
import { getStatusLineItems } from '../zorgned/zorgned-status-line-items.ts';

export function getDocuments(
  sessionID: SessionID,
  aanvraagTransformed: ZorgnedAanvraagTransformed,
  withDownloadBFFEndpoint: string
) {
  if (
    FeatureToggle.zorgnedDocumentAttachmentsActive &&
    isAfterWCAGValidDocumentsDate(aanvraagTransformed.datumAanvraag)
  ) {
    return aanvraagTransformed.documenten
      .filter((document) =>
        typeof document.isVisible !== 'undefined' ? document.isVisible : true
      )
      .map((document) => {
        const idEncrypted = encryptSessionIdWithRouteIdParam(
          sessionID,
          document.id
        );
        return {
          ...document,
          url: generateFullApiUrlBFF(withDownloadBFFEndpoint, [
            {
              id: idEncrypted,
            },
          ]),
        };
      });
  }

  return [];
}

function transformVoorzieningForFrontend(
  aanvraag: ZorgnedAanvraagTransformed,
  steps: StatusLineItem[],
  sessionID: SessionID,
  aanvragen: ZorgnedAanvraagTransformed[]
): WMOVoorzieningFrontend | null {
  const id = aanvraag.prettyID;

  const route = generatePath(themaConfig.detailPage.route.path, {
    id,
  });

  const dateDecision =
    steps.find((step) => step.status === 'Besluit genomen')?.datePublished ??
    '';

  const disclaimer = getHulpmiddelenDisclaimer(
    hulpmiddelenDisclaimerConfig,
    aanvraag,
    aanvragen
  );

  const voorzieningFrontend: WMOVoorzieningFrontend = {
    id,
    title: capitalizeFirstLetter(aanvraag.titel),
    supplier: aanvraag.leverancier,
    isActual: aanvraag.isActueel,
    link: {
      title: 'Meer informatie',
      to: route,
    },
    documents: getDocuments(
      sessionID,
      aanvraag,
      routes.protected.WMO_DOCUMENT_DOWNLOAD
    ),
    steps,
    // NOTE: Keep! This field is added specifically for the Tips api.
    itemTypeCode: aanvraag.productsoortCode,
    decision:
      hasDecision(aanvraag) && aanvraag.resultaat
        ? capitalizeFirstLetter(aanvraag.resultaat)
        : '',
    dateDecision,
    dateDecisionFormatted: dateDecision ? defaultDateFormat(dateDecision) : '',
    displayStatus: getLatestStatus(steps),
    statusDate: getLatestStatusDate(steps),
    statusDateFormatted: getLatestStatusDate(steps, true),
    disclaimer,
  };

  return voorzieningFrontend;
}

export async function fetchWmo(authProfileAndToken: AuthProfileAndToken) {
  const voorzieningenResponse = await fetchZorgnedAanvragenWMO(
    authProfileAndToken.profile.id
  );

  if (voorzieningenResponse.status === 'OK') {
    const today = new Date();

    const voorzieningenFrontend: WMOVoorzieningFrontend[] =
      voorzieningenResponse.content
        .map((aanvraag, _index, aanvragen) => {
          const steps = getStatusLineItems(
            'WMO',
            wmoStatusLineItemsConfig,
            aanvraag,
            aanvragen,
            today
          );

          if (steps) {
            return transformVoorzieningForFrontend(
              aanvraag,
              steps,
              authProfileAndToken.profile.sid,
              aanvragen
            );
          }

          return null;
        })
        .filter((voorziening) => voorziening !== null)
        .toSorted(dateSort('statusDate', 'desc'));

    return apiSuccessResult(voorzieningenFrontend);
  }

  return voorzieningenResponse;
}

export type FetchWmoVoorzieningFilter = (
  voorziening: ZorgnedAanvraagTransformed,
  steps: StatusLineItem[],
  lineItemConfig: ZorgnedStatusLineItemsConfig<ZorgnedAanvraagTransformed>
) => boolean;

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

export const forTesting = {
  transformVoorzieningForFrontend,
  getDocuments,
};
