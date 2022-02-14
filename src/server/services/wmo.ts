import { generatePath } from 'react-router';
import { AppRoutes } from '../../universal/config';
import {
  capitalizeFirstLetter,
  dateSort,
  defaultDateFormat,
  isDateInPast,
} from '../../universal/helpers';
import { hash } from '../../universal/helpers/utils';
import { GenericDocument, LinkProps } from '../../universal/types';
import { getApiConfig } from '../config';
import { requestData } from '../helpers';

// From Mijn Amsterdam WMONed api
export interface WmoApiItem {
  title: string;
  dateStart: string;
  dateEnd: string | null;
  supplier: string | null;
  isActual: boolean;
  dateDecision: string;
  serviceDateStart: string | null;
  serviceDateEnd: string | null;
  serviceOrderDate: string | null;
  itemTypeCode: string;
  deliveryType: 'PGB' | 'ZIN' | '';
}

export interface WmoApiData {
  content?: WmoApiItem[] | null;
  status: 'OK' | 'ERROR';
  message?: string;
}

// To Mijn Amsterdam frontend
export interface WmoItemStep {
  id: string;
  status: string;
  datePublished: string;
  description: string;
  documents: GenericDocument[];
  isActive?: boolean;
  isChecked?: boolean;
  [key: string]: any;
}

export interface WmoItem {
  id: string;
  title: string; // Omschrijving
  supplier: string | null; // Leverancier
  isActual: boolean; // Indicates if this item is designated Current or Previous
  link: LinkProps;
  steps: WmoItemStep[];
  voorzieningsoortcode: WmoApiItem['itemTypeCode'];
}

export function hasFutureDate(
  dateStr: string | Date | null,
  compareDate: Date
) {
  if (dateStr === null) {
    return false;
  }
  return !isDateInPast(dateStr, compareDate);
}

export function hasHistoricDate(
  dateStr: string | Date | null,
  compareDate: Date
) {
  if (dateStr === null) {
    return false;
  }
  return isDateInPast(dateStr, compareDate);
}

export function isServiceDeliveryStarted(
  sourceData: WmoApiItem,
  compareDate: Date
) {
  return hasHistoricDate(sourceData.serviceDateStart, compareDate);
}

export function isServiceDeliveryStopped(
  sourceData: WmoApiItem,
  compareDate: Date
) {
  return hasHistoricDate(sourceData.serviceDateEnd, compareDate);
}

export function isServiceDeliveryActive(
  sourceData: WmoApiItem,
  compareDate: Date
) {
  return (
    sourceData.isActual &&
    isServiceDeliveryStarted(sourceData, compareDate) &&
    !isServiceDeliveryStopped(sourceData, compareDate) &&
    !hasHistoricDate(sourceData.dateEnd, compareDate)
  );
}

type TextPartContent = string;
type TextPartContentFormatter = (
  data: WmoApiItem,
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
      isChecked: (stepIndex: number, data: WmoApiItem, today: Date) => boolean;
      isActive: (stepIndex: number, data: WmoApiItem, today: Date) => boolean;
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
        datePublished: (data) => data.dateDecision,
        isChecked: () => true,
        isActive: (stepIndex, data) => data.isActual === true,
        description: (data) =>
          `
            <p>
              U hebt recht op een ${data.title} per ${defaultDateFormat(
            data.dateStart
          )}. De vervoerspas ontvangt u per
              post.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          `,
      },
      {
        status: 'Einde recht',
        datePublished: (data) => (data.isActual ? '' : data.dateEnd) || '',
        isChecked: () => false,
        isActive: (stepIndex, data) => data.isActual === false,
        description: (data) =>
          `<p>
            ${
              data.isActual
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${data.title} is beëindigd ${
                    data.dateEnd ? `per ${defaultDateFormat(data.dateEnd)}` : ''
                  }`
            }
          </p>`,
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
        datePublished: (data) => data.dateDecision,
        isChecked: (stepIndex, data) => true,
        isActive: (stepIndex, data) => data.isActual === true,
        description: (data) =>
          `
            <p>
              U hebt recht op een ${data.title} per ${defaultDateFormat(
            data.dateStart
          )}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          `,
      },
      {
        status: 'Einde recht',
        datePublished: (data) => (data.isActual ? '' : data.dateEnd) || '',
        isChecked: () => false,
        isActive: (stepIndex, data) => data.isActual === false,
        description: (data) =>
          `
            <p>
              ${
                data.isActual
                  ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                  : `Uw recht op ${data.title} is beëindigd ${
                      data.dateEnd
                        ? `per ${defaultDateFormat(data.dateEnd)}`
                        : ''
                    }`
              }
            </p>
            ${
              data.isActual && data.deliveryType === 'PGB'
                ? `<p>
                Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
                verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
              </p>`
                : ''
            }
          `,
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
        datePublished: (data) => data.dateDecision,
        isChecked: (stepIndex, data) => true,
        isActive: (stepIndex, data) => data.isActual === true,
        description: (data) =>
          `
            <p>
              U hebt recht op ${data.title} per ${defaultDateFormat(
            data.dateStart
          )}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          `,
      },
      {
        status: 'Einde recht',
        datePublished: (data) => data.dateEnd || '',
        isChecked: () => false,
        isActive: (stepIndex, data) => data.isActual === false,
        description: (data) =>
          `
            <p>
              ${
                data.isActual
                  ? `Op deze datum vervalt uw recht op ${data.title}.`
                  : `Uw recht op ${data.title} is beëindigd ${
                      data.dateEnd
                        ? `per ${defaultDateFormat(data.dateEnd)}`
                        : ''
                    }`
              }
            </p>

            ${
              data.isActual
                ? `<p>
                Uiterlijk 8 weken voor de einddatum van uw PGB moet u een
                verlenging aanvragen. Hoe u dit doet, leest u in uw besluit.
              </p>`
                : ''
            }
          `,
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
        datePublished: (data) => data.dateDecision,
        isChecked: () => true,
        isActive: (stepIndex, sourceData: WmoApiItem, today) =>
          !isServiceDeliveryStarted(sourceData, today),
        description: (data: WmoApiItem) => {
          return `
              <p>
                U hebt recht op ${data.title} per ${defaultDateFormat(
            data.dateStart
          )}.
              </p>
              <p>
                ${
                  data.isActual &&
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
                  ].includes(data.itemTypeCode)
                    ? `
                    In de brief leest u ook hoe u bezwaar kunt maken, een klacht
                    kan indienen of <u>hoe u van aanbieder kunt wisselen.</u>
                  `
                    : `In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.`
                }
              </p>
            `;
        },
      },
      {
        status: 'Levering gestart',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData: WmoApiItem, today: Date) =>
          isServiceDeliveryStarted(sourceData, today),
        isActive: (stepIndex, sourceData: WmoApiItem, today: Date) =>
          isServiceDeliveryActive(sourceData, today),
        description: (data) =>
          `<p>
            ${data.supplier} is gestart met het leveren van ${data.title}.
          </p>`,
      },
      {
        status: 'Levering gestopt',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData: WmoApiItem, today: Date) =>
          isServiceDeliveryStopped(sourceData, today) ||
          hasHistoricDate(sourceData.dateEnd, today),
        isActive: (stepIndex, sourceData: WmoApiItem, today) =>
          sourceData.isActual &&
          isServiceDeliveryStopped(sourceData, today) &&
          !sourceData.dateEnd,
        description: (data) =>
          `<p>
            ${
              data.isActual
                ? 'Niet van toepassing.'
                : `${data.supplier} heeft aan ons doorgegeven dat u geen ${data.title}
            meer krijgt.`
            }
          </p>`,
      },
      {
        status: 'Einde recht',
        datePublished: (data, today) =>
          (hasFutureDate(data.dateEnd, today) ? '' : data.dateEnd) || '',
        isChecked: (stepIndex, sourceData, today) =>
          sourceData.isActual === false ||
          hasHistoricDate(sourceData.dateEnd, today),
        isActive: (stepIndex, sourceData, today) =>
          sourceData.isActual === false ||
          hasHistoricDate(sourceData.dateEnd, today),
        description: (sourceData, today) =>
          `<p>
            ${
              sourceData.isActual && hasFutureDate(sourceData.dateEnd, today)
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${sourceData.title} is beëindigd ${
                    sourceData.dateEnd
                      ? `per ${defaultDateFormat(sourceData.dateEnd)}`
                      : ''
                  }`
            }
          </p>`,
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
        datePublished: (data) => data.dateDecision,
        isChecked: () => true,
        isActive: (stepIndex, sourceData, today) =>
          !hasHistoricDate(sourceData.serviceOrderDate, today),
        description: (data) =>
          `
            <p>
              U hebt recht op een ${data.title} per ${defaultDateFormat(
            data.dateStart
          )}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          `,
      },
      {
        status: 'Opdracht gegeven',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData, today: Date) =>
          hasHistoricDate(sourceData.serviceOrderDate, today),
        isActive: (stepIndex, sourceData, today) =>
          hasHistoricDate(sourceData.serviceOrderDate, today) &&
          !isServiceDeliveryStarted(sourceData, today),
        description: (data) =>
          `<p>
            De gemeente heeft opdracht gegeven aan ${data.supplier} om een ${data.title} aan u te leveren.
          </p>`,
      },
      {
        status: 'Product geleverd',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData, today) =>
          isServiceDeliveryStarted(sourceData, today),
        isActive: (stepIndex, sourceData, today: Date) =>
          isServiceDeliveryActive(sourceData, today),
        description: (data) =>
          `<p>
            ${data.supplier} heeft aan ons doorgegeven dat een ${data.title} bij u is afgeleverd.
          </p>`,
      },
      {
        status: 'Einde recht',
        datePublished: (data) => (data.isActual ? '' : data.dateEnd) || '',
        isChecked: (stepIndex, sourceData) => sourceData.isActual === false,
        isActive: (stepIndex, sourceData) => sourceData.isActual === false,
        description: (data) =>
          `<p>
            ${
              data.isActual
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${data.title} is beëindigd${
                    data.dateEnd
                      ? ` per ${defaultDateFormat(data.dateEnd)}`
                      : ''
                  }.`
            }
          </p>`,
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
        datePublished: (data) => data.dateDecision,
        isChecked: () => true,
        isActive: (stepIndex, sourceData, today) =>
          !hasHistoricDate(sourceData.serviceOrderDate, today),
        description: (data) =>
          `
            <p>
              U hebt recht op een ${data.title} per ${defaultDateFormat(
            data.dateStart
          )}.
            </p>
            <p>
              In de brief leest u ook hoe u bezwaar kunt maken of een klacht kan
              indienen.
            </p>
          `,
      },
      {
        status: 'Opdracht gegeven',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData, today: Date) =>
          hasHistoricDate(sourceData.serviceOrderDate, today),
        isActive: (stepIndex, sourceData, today) =>
          hasHistoricDate(sourceData.serviceOrderDate, today) &&
          !isServiceDeliveryStarted(sourceData, today),
        description: (data) =>
          `<p>
            De gemeente heeft opdracht gegeven aan ${data.supplier} om de aanpassingen aan uw woning uit
            te voeren.
          </p>`,
      },
      {
        status: 'Aanpassing uitgevoerd',
        datePublished: () => '',
        isChecked: (stepIndex, sourceData, today) =>
          isServiceDeliveryStarted(sourceData, today),
        isActive: (stepIndex, sourceData, today) =>
          isServiceDeliveryActive(sourceData, today),
        description: (data) =>
          `<p>
            ${data.supplier} heeft aan ons doorgegeven dat de
            aanpassing aan uw woning is uitgevoerd.
          </p>`,
      },
      {
        status: 'Einde recht',
        datePublished: (data) => (data.isActual ? '' : data.dateEnd) || '',
        isChecked: (stepIndex, sourceData) => sourceData.isActual === false,
        isActive: (stepIndex, sourceData, today) =>
          sourceData.isActual === false,
        description: (data) =>
          `<p>
            ${
              data.isActual
                ? 'Op het moment dat uw recht stopt, ontvangt u hiervan bericht.'
                : `Uw recht op ${data.title} is beëindigd ${
                    data.dateEnd ? `per ${defaultDateFormat(data.dateEnd)}` : ''
                  }`
            }
          </p>`,
      },
    ],
  },
};

function parseLabelContent(
  text: TextPartContents,
  sourceData: WmoApiItem,
  today: Date
): string {
  let rText = text || '';

  if (typeof rText === 'function') {
    return rText(sourceData, today);
  }

  return rText;
}

function formatWmoStatusLineItems(
  wmoItem: WmoApiItem,
  today: Date
): WmoItemStep[] {
  const labelData = Object.values(Labels).find((labelData) => {
    const type = wmoItem.deliveryType || '';
    return (
      labelData.deliveryType[type] &&
      labelData.deliveryType[type]!.includes(wmoItem.itemTypeCode)
    );
  });

  if (labelData) {
    const steps: WmoItemStep[] = labelData.statusItems.map(
      (statusItem, index) => {
        const datePublished = parseLabelContent(
          statusItem.datePublished,
          wmoItem,
          today
        ) as string;

        const stepData: WmoItemStep = {
          id: `status-step-${index}`,
          status: statusItem.status,
          description: parseLabelContent(
            statusItem.description,
            wmoItem,
            today
          ),
          datePublished,
          isActive: statusItem.isActive(index, wmoItem, today),
          isChecked: statusItem.isChecked(index, wmoItem, today),
          documents: [], // NOTE: To be implemented
        };

        if (index === 0) {
          stepData.altDocumentContent = `<p>
            <strong>
              ${
                wmoItem.isActual
                  ? 'U krijgt dit besluit per post.'
                  : 'U hebt dit besluit per post ontvangen.'
              }
            </strong>
          </p>`;
        }

        return stepData;
      }
    );

    return steps;
  }

  return [];
}

export function transformWmoResponse(
  responseData: WmoApiItem[],
  today: Date
): WmoItem[] {
  const items = responseData
    .sort(dateSort('dateStart', 'desc'))
    .map((wmoItem, index) => {
      const id = hash(`${wmoItem.title}-${index}`).toLowerCase();
      const steps: WmoItem['steps'] = formatWmoStatusLineItems(wmoItem, today);
      const route = generatePath(AppRoutes['ZORG/VOORZIENINGEN'], {
        id,
      });

      return {
        id,
        title: capitalizeFirstLetter(wmoItem.title),
        dateStart: defaultDateFormat(wmoItem.dateStart),
        dateEnd: wmoItem.dateEnd ? defaultDateFormat(wmoItem.dateEnd) : '',
        supplier: wmoItem.supplier,
        isActual: wmoItem.isActual,
        link: {
          title: 'Meer informatie',
          to: route,
        },
        steps,
        // This field is added specifically for the Tips api.
        voorzieningsoortcode: wmoItem.itemTypeCode,
      };
    });

  return items;
}

export function fetchWmo(
  sessionID: SessionID,
  passthroughRequestHeaders: Record<string, string>
) {
  return requestData<WmoItem[]>(
    getApiConfig('WMO', {
      transformResponse: (responseData: WmoApiData) => {
        return transformWmoResponse(responseData.content || [], new Date());
      },
    }),
    sessionID,
    passthroughRequestHeaders
  );
}
