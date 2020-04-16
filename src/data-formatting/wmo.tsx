import { AppRoutes } from 'config/Routing.constants';
import { StatusLineItem } from 'components/StatusLine/StatusLine';
import slug from 'slug';
import { LinkProps } from '../App.types';
import {
  defaultDateFormat,
  isDateInPast,
  capitalizeFirstLetter,
  dateSort,
} from '../helpers/App';
import React from 'react';
import { StepType } from '../components/StatusLine/StatusLine';
import { generatePath } from 'react-router';

// Example data
// [
//   {
//     Omschrijving: 'ambulante ondersteuning',
//     Wet: 1,
//     Actueel: true,
//     Volume: 1,
//     Eenheid: '82',
//     Frequentie: 3,
//     Leveringsvorm: 'ZIN',
//     Omvang: '1 stuks per vier weken',
//     Leverancier: 'Leger des Heils',
//     Checkdatum: '2019-10-09T00:00:00',
//     Voorzieningsoortcode: 'AO5',
//     Voorzieningcode: '021',
//     Aanvraagdatum: '2018-11-20T00:00:00',
//     Beschikkingsdatum: '2018-11-22T00:00:00',
//     VoorzieningIngangsdatum: '2018-11-20T00:00:00',
//     VoorzieningEinddatum: '2019-11-20T00:00:00',
//     Levering: {
//       Opdrachtdatum: '2018-11-22T00:00:00',
//       Leverancier: 'Z00118',
//       IngangsdatumGeldigheid: '2018-11-20T00:00:00',
//       EinddatumGeldigheid: '2019-11-20T00:00:00',
//       StartdatumLeverancier: '2018-11-20T00:00:00',
//       EinddatumLeverancier: null,
//     },
//   },
// ];

export interface WmoProcessItem extends StatusLineItem {
  id: string;
  status: string;
  description: JSX.Element | string;
  datePublished: string;
}

export interface WmoItem {
  id: string;
  title: string; // Omschrijving
  supplier: string; // Leverancier
  supplierUrl: string; // Leverancier url
  isActual: boolean; // Indicates if this item is designated Current or Previous
  link: LinkProps;
  process: WmoProcessItem[];
}

function isDateInFuture(dateStr: string | Date, compareDate: Date) {
  return !isDateInPast(dateStr, compareDate);
}

type TextPartContent = string | JSX.Element;
type TextPartContentFormatter = (
  data: WmoSourceData,
  today: Date
) => TextPartContent;
type TextPartContents = TextPartContent | TextPartContentFormatter;

// NOTE: See Functional Design document with information
const Labels: {
  [productGroupName: /* leveringsvorm */ string]: {
    deliveryType: {
      PGB?: string[];
      ZIN?: string[];
      ''?: string[];
    };
    statusItems: Array<{
      status: string;
      datePublished: TextPartContents;
      description: TextPartContents;
      isChecked: (
        stepIndex: number,
        data: WmoSourceData,
        today: Date
      ) => boolean;
      isLastActive: (
        stepIndex: number,
        data: WmoSourceData,
        today: Date
      ) => boolean;
    }>;
  };
} = {
  AOV: {
    deliveryType: {
      ZIN: ['AOV'],
      PGB: ['AOV'],
      '': ['AOV'],
    },
    statusItems: [
      {
        status: 'Besluit',
        datePublished: data => data.dateDecision,
        isChecked: (stepIndex, data) => data.isActual === false,
        isLastActive: (stepIndex, data) => data.isActual === true,
        description: data => (
          <>
            <p>
              U hebt recht op een {data.title} per{' '}
              {defaultDateFormat(data.dateStart)}. De vervoerspas ontvangt u per
              post.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          </>
        ),
      },
      {
        status: 'Einde recht',
        datePublished: data => (data.isActual ? '' : data.dateFinish),
        isChecked: () => false,
        isLastActive: (stepIndex, data) => data.isActual === false,
        description: data => (
          <p>
            {data.isActual
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${data.title} is beëindigd per ${defaultDateFormat(
                  data.dateFinish
                )}`}
          </p>
        ),
      },
    ],
  },

  // Vergoeding
  Compensation: {
    deliveryType: {
      ZIN: ['FIN', 'MVV', 'MVW', 'VHK', 'VVD', 'VVK'],
      PGB: [
        'AAN',
        'FIE',
        'FIN',
        'MVV',
        'MVW',
        'OVE',
        'PER',
        'ROL',
        'RWD',
        'RWT',
        'SCO',
        'VHK',
        'VVD',
        'VVK',
        'WRA',
        'WRA1',
        'WRA2',
        'WRA3',
        'WRA4',
        'WRA5',
      ],
      '': ['FIE', 'FIN', 'MVV', 'MVW', 'VHK', 'VVK'],
    },
    statusItems: [
      {
        status: 'Besluit',
        datePublished: data => data.dateDecision,
        isChecked: (stepIndex, data) => data.isActual === false,
        isLastActive: (stepIndex, data) => data.isActual === true,
        description: data => (
          <>
            <p>
              U hebt recht op een {data.title} per{' '}
              {defaultDateFormat(data.dateStart)}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          </>
        ),
      },
      {
        status: 'Einde recht',
        datePublished: data => (data.isActual ? '' : data.dateFinish),
        isChecked: () => false,
        isLastActive: (stepIndex, data) => data.isActual === false,
        description: data => (
          <>
            <p>
              {data.isActual
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${
                    data.title
                  } is beëindigd per ${defaultDateFormat(data.dateFinish)}`}
            </p>
            {data.isActual && data.deliveryType === 'PGB' && (
              <p>
                Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
                verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
              </p>
            )}
          </>
        ),
      },
    ],
  },

  PGB: {
    deliveryType: {
      PGB: [
        'AO2',
        'AO3',
        'AO4',
        'AO5',
        'BSW',
        'DBA',
        'DBH',
        'DBS',
        'KVB',
        'WMH',
      ],
    },
    statusItems: [
      {
        status: 'Besluit',
        datePublished: data => data.dateDecision,
        isChecked: (stepIndex, data) => data.isActual === false,
        isLastActive: (stepIndex, data) => data.isActual === true,
        description: data => (
          <>
            <p>
              U hebt recht op {data.title} per{' '}
              {defaultDateFormat(data.dateStart)}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          </>
        ),
      },
      {
        status: 'Einde recht',
        datePublished: data => data.dateFinish || '',
        isChecked: () => false,
        isLastActive: (stepIndex, data) => data.isActual === false,
        description: data => (
          <>
            <p>
              {data.isActual
                ? `Op deze datum vervalt uw recht op ${data.title}.`
                : `Uw recht op ${
                    data.title
                  } is beëindigd per ${defaultDateFormat(data.dateFinish)}`}
            </p>

            {data.isActual && (
              <p>
                Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
                verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
              </p>
            )}
          </>
        ),
      },
    ],
  },

  // Diensten
  Services: {
    deliveryType: {
      ZIN: [
        'AO1',
        'AO2',
        'AO3',
        'AO4',
        'AO5',
        'AO6',
        'AO7',
        'AO8',
        'BSW',
        'DBA',
        'DBH',
        'DBL',
        'DBS',
        'KVB',
        'MAO',
        'WMH',
      ],
      '': ['AO2', 'AO5', 'DBS', 'KVB', 'WMH'],
    },
    statusItems: [
      {
        status: 'Besluit',
        datePublished: data => data.dateDecision,
        isChecked: (stepIndex, sourceData: WmoSourceData) => true,
        isLastActive: (stepIndex, sourceData: WmoSourceData) => false,
        description: (data: WmoSourceData) => {
          return (
            <>
              <p>
                U hebt recht op {data.title} per{' '}
                {defaultDateFormat(data.dateStart)}.
              </p>
              <p>
                {data.isActual &&
                [
                  'WMH',
                  'AO1',
                  'AO2',
                  'AO3',
                  'AO4',
                  'AO5',
                  'AO6',
                  'AO7',
                  'AO8',
                  'DBA',
                  'DBH',
                  'DBL',
                  'DBS',
                  'KVB',
                ].includes(data.itemTypeCode) ? (
                  <>
                    In de brief leest u ook hoe u bezwaar kunt maken, een klacht
                    kan indienen of <u>hoe u van aanbieder kunt wisselen.</u>
                  </>
                ) : (
                  `In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.`
                )}
              </p>
            </>
          );
        },
      },
      {
        status: 'Levering gestart',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData: WmoSourceData, today: Date) =>
          sourceData.isActual === false ||
          isDateInPast(sourceData.dateFinish, today),
        isLastActive: (stepIndex, sourceData: WmoSourceData, today: Date) =>
          sourceData.isActual === true &&
          isDateInFuture(sourceData.dateFinish, today),
        description: data => (
          <p>
            {data.supplier} is gestart met het leveren van {data.title}.
          </p>
        ),
      },
      {
        status: 'Levering gestopt',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData: WmoSourceData, today: Date) =>
          sourceData.isActual === false ||
          isDateInPast(sourceData.dateFinish, today),
        isLastActive: (stepIndex, sourceData: WmoSourceData) => false,
        description: data => (
          <p>
            {data.isActual
              ? 'Niet van toepassing.'
              : `${data.supplier} heeft aan ons doorgegeven dat u geen ${data.title}
            meer krijgt.`}
          </p>
        ),
      },
      {
        status: 'Einde recht',
        datePublished: (data, today) =>
          isDateInFuture(data.dateFinish, today) ? '' : data.dateFinish,
        isChecked: () => false,
        isLastActive: (stepIndex, sourceData: WmoSourceData, today: Date) =>
          sourceData.isActual === false ||
          isDateInPast(sourceData.dateFinish, today),
        description: (data, today) => (
          <p>
            {data.isActual && isDateInFuture(data.dateFinish, today)
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${data.title} is beëindigd per ${defaultDateFormat(
                  data.dateFinish
                )}`}
          </p>
        ),
      },
    ],
  },

  // Zorg in natura (Hulpmiddelen)
  SupportProducts: {
    deliveryType: {
      ZIN: ['AAN', 'AUT', 'FIE', 'GBW', 'OVE', 'ROL', 'RWD', 'RWT', 'SCO'],
      '': ['AAN', 'FIE'],
    },
    statusItems: [
      {
        status: 'Besluit',
        datePublished: data => data.dateDecision,
        isChecked: () => true,
        isLastActive: () => false,
        description: data => (
          <>
            <p>
              U hebt recht op een {data.title} per{' '}
              {defaultDateFormat(data.dateStart)}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          </>
        ),
      },
      {
        status: 'Opdracht gegeven',
        datePublished: () => '',
        isChecked: (stepIndex, data, today: Date) =>
          data.isActual === false ||
          isDateInPast(data.dateStartServiceDelivery, today),
        isLastActive: (stepIndex, data, today: Date) =>
          data.isActual
            ? isDateInFuture(data.dateStartServiceDelivery, today)
            : false,
        description: data => (
          <p>
            De gemeente heeft opdracht gegeven aan{' '}
            {data.serviceDeliverySupplier} om een {data.title} aan u te leveren.
          </p>
        ),
      },
      {
        status: 'Product geleverd',
        datePublished: () => '',
        isChecked: (stepIndex, data) => data.isActual === false,
        isLastActive: (stepIndex, data, today: Date) =>
          data.isActual
            ? isDateInPast(data.dateStartServiceDelivery, today)
            : false,
        description: data => (
          <p>
            {data.serviceDeliverySupplier} heeft aan ons doorgegeven dat een{' '}
            {data.title} bij u is afgeleverd.
          </p>
        ),
      },
      {
        status: 'Einde recht',
        datePublished: data => (data.isActual ? '' : data.dateFinish),
        isChecked: () => false,
        isLastActive: (stepIndex, data) => data.isActual === false,
        description: data => (
          <p>
            {data.isActual
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${data.title} is beëindigd per ${defaultDateFormat(
                  data.dateFinish
                )}`}
          </p>
        ),
      },
    ],
  },

  // Zorg in natura (WRA)
  WRA: {
    deliveryType: {
      ZIN: ['ZIN', 'WRA', 'WRA1', 'WRA2', 'WRA3', 'WRA4', 'WRA5'],
    },
    statusItems: [
      {
        status: 'Besluit',
        datePublished: data => data.dateDecision,
        isChecked: () => true,
        isLastActive: () => false,
        description: data => (
          <>
            <p>
              U hebt recht op een {data.title} per{' '}
              {defaultDateFormat(data.dateStart)}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          </>
        ),
      },
      {
        status: 'Opdracht gegeven',
        datePublished: () => '',
        isChecked: (stepIndex, data, today: Date) =>
          data.isActual === false ||
          isDateInPast(data.dateStartServiceDelivery, today),
        isLastActive: (stepIndex, data, today: Date) =>
          data.isActual
            ? isDateInFuture(data.dateStartServiceDelivery, today)
            : false,
        description: data => (
          <p>
            De gemeente heeft opdracht gegeven aan{' '}
            {data.serviceDeliverySupplier} om de aanpassingen aan uw woning uit
            te voeren.
          </p>
        ),
      },
      {
        status: 'Aanpassing uitgevoerd',
        datePublished: () => '',
        isChecked: (stepIndex, data) => data.isActual === false,
        isLastActive: (stepIndex, data, today: Date) =>
          data.isActual
            ? isDateInPast(data.dateStartServiceDelivery, today)
            : false,
        description: data => (
          <p>
            {data.serviceDeliverySupplier} heeft aan ons doorgegeven dat de
            aanpassing aan uw woning is uitgevoerd.
          </p>
        ),
      },
      {
        status: 'Einde recht',
        datePublished: data => (data.isActual ? '' : data.dateFinish),
        isChecked: () => false,
        isLastActive: (stepIndex, data) => data.isActual === false,
        description: data => (
          <p>
            {data.isActual
              ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
              : `Uw recht op ${data.title} is beëindigd per ${defaultDateFormat(
                  data.dateFinish
                )}`}
          </p>
        ),
      },
    ],
  },
};

export function parseLabelContent(
  text: TextPartContents,
  data: WmoSourceData,
  today: Date
): string | JSX.Element {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(data, today);
  }

  return rText;
}

function formatWmoProcessItems(
  data: WmoSourceData,
  today: Date
): WmoProcessItem[] {
  const labelData = Object.values(Labels).find((labelData, index) => {
    const type = data.deliveryType || '';
    return (
      labelData.deliveryType[type] &&
      labelData.deliveryType[type]!.includes(data.itemTypeCode)
    );
  });

  if (labelData) {
    const stepCount = labelData.statusItems.length;
    const items: WmoProcessItem[] = labelData.statusItems.map(
      (statusItem, index) => {
        const datePublished = parseLabelContent(
          statusItem.datePublished,
          data,
          today
        ) as string;

        let stepType: StepType = 'intermediate-step';

        if (index === 0) {
          stepType = 'first-step';
        } else if (index === stepCount - 1) {
          stepType = 'last-step';
        }

        return {
          id: `status-step-${index}`,
          status: statusItem.status,
          description: parseLabelContent(statusItem.description, data, today),
          datePublished,
          isLastActive: statusItem.isLastActive(index, data, today),
          isChecked: statusItem.isChecked(index, data, today),
          stepType,
          documents: [], // NOTE: To be implemented late 2020
        };
      }
    );

    return items;
  }

  return [];
}

interface WmoSourceData {
  title: string;
  dateStart: string;
  dateFinish: string;
  supplier: string;
  isActual: boolean;
  dateDecision: string;
  dateStartServiceDelivery: string;
  dateFinishServiceDelivery: string;
  dateRequestOrderStart: string;
  serviceDeliverySupplier: string;
  itemTypeCode: string;
  deliveryType: 'PGB' | 'ZIN' | '';
}

interface WmoApiLevering {
  Opdrachtdatum: string;
  Leverancier: string;
  IngangsdatumGeldigheid: string;
  EinddatumGeldigheid: string | null;
  StartdatumLeverancier: string;
  EinddatumLeverancier: string | null;
}

export interface WmoApiItem {
  Omschrijving: string;
  Wet: number;
  Actueel: boolean;
  Volume: number;
  Eenheid: string;
  Frequentie: number;
  Leveringsvorm: 'ZIN' | 'PGB' | '';
  Omvang: string;
  Leverancier: string;
  Checkdatum: string | null;
  Voorzieningsoortcode: string;
  Voorzieningcode: string;
  Aanvraagdatum: string;
  Beschikkingsdatum: string;
  VoorzieningIngangsdatum: string;
  VoorzieningEinddatum: string | null;
  Levering: WmoApiLevering | null;
}

export type WmoApiResponse = WmoApiItem[];

export function formatWmoApiResponse(
  wmoApiResponseData: WmoApiResponse,
  today: Date
): WmoItem[] {
  if (!Array.isArray(wmoApiResponseData)) {
    return [];
  }
  const items = wmoApiResponseData
    .sort(dateSort('VoorzieningIngangsdatum', 'desc'))
    .map((item, index) => {
      const {
        Omschrijving: title,
        VoorzieningIngangsdatum: dateStart,
        VoorzieningEinddatum: dateFinish,
        Leverancier: supplier,
        Actueel: isActual,
        Beschikkingsdatum: dateDecision,
        Voorzieningsoortcode: itemTypeCode,
        Leveringsvorm: deliveryType,
      } = item;

      const {
        StartdatumLeverancier: dateStartServiceDelivery,
        EinddatumLeverancier: dateFinishServiceDelivery,
        Opdrachtdatum: dateRequestOrderStart,
      } = (item.Levering || {}) as WmoApiLevering;

      const id = slug(`${title}-${index}`).toLowerCase();

      const process: WmoItem['process'] = formatWmoProcessItems(
        {
          title,
          dateStart,
          dateFinish: dateFinish || '',
          supplier,
          isActual,
          dateDecision,
          dateStartServiceDelivery,
          dateFinishServiceDelivery: dateFinishServiceDelivery || '',
          dateRequestOrderStart,
          serviceDeliverySupplier: supplier || 'Onbekend',
          itemTypeCode,
          deliveryType,
        },
        today
      );

      const route = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
        id,
      });

      return {
        id,
        title: capitalizeFirstLetter(title),
        dateStart: defaultDateFormat(dateStart),
        dateFinish: dateFinish ? defaultDateFormat(dateFinish) : '',
        supplier,
        // TODO: See if we can get a url to the suppliers websites
        supplierUrl: '',
        isActual,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        process,
      };
    });

  return items;
}
