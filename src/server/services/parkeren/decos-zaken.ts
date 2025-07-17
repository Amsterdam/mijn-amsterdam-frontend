import { parseISO } from 'date-fns';

import {
  type BZB,
  type BZP,
  caseTypeParkeren,
  type EigenParkeerplaatsOpheffen,
  type EigenParkeerplaatsRequestType,
  type EigenParkeerplaats,
  type GPK,
  type GPP,
  type TouringcarDagontheffing,
  type TouringcarJaarontheffing,
} from './config-and-types';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import {
  dateEnd,
  dateStart,
  destination,
  kentekens,
  location,
  SELECT_FIELDS_TRANSFORM_BASE,
  timeEnd,
  timeStart,
  transformDecision,
} from '../decos/decos-field-transformers';
import {
  getCustomTitleForDecosZaakWithLicensePlates,
  isZaakDecisionVerleend,
  transformBoolean,
  transformKenteken,
} from '../decos/decos-helpers';
import { DecosZaakTransformer } from '../decos/decos-types';

const GPP: DecosZaakTransformer<GPP> = {
  isActive: true,
  caseType: caseTypeParkeren.GPP,
  title: 'Vaste parkeerplaats voor gehandicapten (GPP)',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Ingetrokken: ['Ingetrokken i.v.m. overlijden of verhuizing'],
      '': ['Nog niet bekend'],
    }),
    text7: kentekens,
    text14: {
      name: 'kentekenNieuw',
      transform: transformKenteken,
    },
    text8: location,
  },
  async afterTransform(vergunning) {
    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);
    return vergunning;
  },
};

const GPK: DecosZaakTransformer<GPK> = {
  isActive: true,
  caseType: caseTypeParkeren.GPK,
  title: 'Europese gehandicaptenparkeerkaart (GPK)',
  isVerleend(decosZaak) {
    return isZaakDecisionVerleend(decosZaak, [
      'Verleend',
      'Verleend Bestuurder, niet verleend Passagier',
      'Verleend Passagier, niet verleend Bestuurder',
    ]);
  },
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Ingetrokken: [
        'Ingetrokken i.v.m. overlijden of verhuizing',
        'Ingetrokken verleende GPK wegens overlijden',
      ],
      '': ['Nog niet bekend'],
      'Verleend Bestuurder, niet verleend Passagier': [
        'Verleend Bestuurder met GPP (niet verleend passagier)',
        // Decos cuts of the field at 50 chars, we sadly have to anticipate on this
        'Verleend Bestuurder met GPP (niet verleend passagi',
      ],
      Verleend: ['Verleend met GPP', 'Verleend vervangend GPK'],
      'Verleend Passagier, niet verleend Bestuurder': [
        'Verleend Passagier met GPP (niet verleend Bestuurder)',
        // Decos cuts of the field at 50 chars, we sadly have to anticipate on this
        'Verleend Passagier met GPP (niet verleend Bestuurd',
      ],
    }),
    date6: dateStart,
    date7: dateEnd,
    num3: { name: 'cardNumber' },
    text7: { name: 'cardType' },
  },
};

const BZP: DecosZaakTransformer<BZP> = {
  isActive: true,
  caseType: caseTypeParkeren.BZP,
  title: capitalizeFirstLetter(caseTypeParkeren.BZP.toLowerCase()),
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text8: kentekens,
  },
  async afterTransform(vergunning, decosZaakSource) {
    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);
    return vergunning;
  },
};

const BZB: DecosZaakTransformer<BZB> = {
  isActive: true,
  caseType: caseTypeParkeren.BZB,
  title: capitalizeFirstLetter(caseTypeParkeren.BZB.toLowerCase()),
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    company: { name: 'companyName' },
    num6: { name: 'numberOfPermits' },
  },
};

const EigenParkeerplaats: DecosZaakTransformer<EigenParkeerplaats> = {
  isActive: true,
  caseType: caseTypeParkeren.EigenParkeerplaats,
  title: capitalizeFirstLetter(
    caseTypeParkeren.EigenParkeerplaats.toLowerCase()
  ),
  fetchWorkflowStatusDatesFor: [
    {
      status: 'In behandeling',
      decosActionCode:
        'Status bijwerken en notificatie verzenden - In behandeling',
    },
  ],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date8: dateEnd,
    text13: kentekens,
    text14: { ...kentekens, name: 'vorigeKentekens' },
  },
  additionalSelectFields: [
    'text25',
    'text17',
    'num14',
    'text18',
    'text19',
    'text20',
    'text15',
    'num15',
    'text21',
    'text22',
    'bol9',
    'bol8',
    'bol10',
    'bol11',
    'bol7',
  ],
  requirePayment: true,
  hasValidSourceData: (decosZaak) => {
    const dateNotBefore = new Date('2023-08-08');
    const dateRequest = parseISO(decosZaak.fields.document_date);

    return dateRequest >= dateNotBefore;
  },
  async afterTransform(vergunning, zaakSource) {
    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);

    const locations: (typeof vergunning)['locations'] = [];

    function toStringOrEmptyString(inp: unknown) {
      return inp ? String(inp) : '';
    }

    if (zaakSource.fields.text25) {
      locations.push({
        type: toStringOrEmptyString(zaakSource.fields.text17),
        street: toStringOrEmptyString(zaakSource.fields.text25),
        houseNumber: toStringOrEmptyString(zaakSource.fields.num14),
        fiscalNumber: toStringOrEmptyString(zaakSource.fields.text18),
        url: toStringOrEmptyString(zaakSource.fields.text19),
      });
    }

    if (zaakSource.fields.text15) {
      locations.push({
        type: toStringOrEmptyString(zaakSource.fields.text20),
        street: toStringOrEmptyString(zaakSource.fields.text15),
        houseNumber: toStringOrEmptyString(zaakSource.fields.num15),
        fiscalNumber: toStringOrEmptyString(zaakSource.fields.text21),
        url: toStringOrEmptyString(zaakSource.fields.text22),
      });
    }

    vergunning.locations = locations;

    const requestTypes: Record<string, EigenParkeerplaatsRequestType> = {
      bol9: 'Nieuwe aanvraag',
      bol8: 'Autodeelbedrijf',
      bol10: 'Kentekenwijziging',
      bol11: 'Verhuizing',
      bol7: 'Verlenging',
    };

    vergunning.requestTypes = Object.entries(requestTypes)
      .map(([decosFieldNameSource, targetValue]) => {
        return zaakSource.fields[decosFieldNameSource]
          ? targetValue
          : undefined;
      })
      .filter(
        (
          requestType: EigenParkeerplaatsRequestType | undefined
        ): requestType is EigenParkeerplaatsRequestType =>
          typeof requestType !== 'undefined'
      );

    return vergunning;
  },
};

const EigenParkeerplaatsOpheffen: DecosZaakTransformer<EigenParkeerplaatsOpheffen> =
  {
    isActive: true,
    caseType: caseTypeParkeren.EigenParkeerplaatsOpheffen,
    title: capitalizeFirstLetter(
      caseTypeParkeren.EigenParkeerplaatsOpheffen.toLowerCase()
    ),
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        decosActionCode:
          'Status bijwerken en notificatie verzenden - In behandeling',
      },
    ],
    requirePayment: true,
    hasValidSourceData: EigenParkeerplaats.hasValidSourceData,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      bol8: 'isCarsharingpermit',
      date8: 'dateEnd',
      text13: 'kentekens',
    },
    additionalSelectFields: ['text25', 'num14', 'text17', 'text19', 'text18'],
    async afterTransform(vergunning, zaakSource) {
      vergunning.location = {
        street: zaakSource.fields.text25?.toString() ?? null,
        houseNumber: zaakSource.fields.num14?.toString() ?? null,
        type: zaakSource.fields.text17?.toString() ?? null,
        url: zaakSource.fields.text19?.toString() ?? null,
        fiscalNumber: zaakSource.fields.text18?.toString() ?? null,
      };
      vergunning.title =
        getCustomTitleForDecosZaakWithLicensePlates(vergunning);
      return vergunning;
    },
  };

const TouringcarDagontheffing: DecosZaakTransformer<TouringcarDagontheffing> = {
  isActive: true,
  caseType: caseTypeParkeren.TouringcarDagontheffing,
  title: capitalizeFirstLetter(
    caseTypeParkeren.TouringcarDagontheffing.toLowerCase()
  ),
  fetchWorkflowStatusDatesFor: [
    { status: 'In behandeling', decosActionCode: 'Status naar in behandeling' },
  ],
  requirePayment: true,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    text14: timeStart,
    text15: timeEnd,
    text10: kentekens,
    text7: destination,
  },
  async afterTransform(vergunning) {
    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);
    return vergunning;
  },
};

const TouringcarJaarontheffing: DecosZaakTransformer<TouringcarJaarontheffing> =
  {
    isActive: true,
    caseType: caseTypeParkeren.TouringcarJaarontheffing,
    title: capitalizeFirstLetter(
      caseTypeParkeren.TouringcarJaarontheffing.toLowerCase()
    ),
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        decosActionCode: 'Status naar In Behandeling',
      },
    ],
    requirePayment: true,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date7: dateEnd,
      text39: kentekens,
      text7: destination,
      bol8: { name: 'routetest', transform: transformBoolean },
    },
    async afterTransform(vergunning) {
      if ('routetest' in vergunning && vergunning.routetest) {
        vergunning.title = getCustomTitleForDecosZaakWithLicensePlates({
          ...vergunning,
          title: 'Touringcar jaarontheffing met routetoets',
        });
      } else {
        vergunning.title =
          getCustomTitleForDecosZaakWithLicensePlates(vergunning);
      }
      return vergunning;
    },
  };

export const decosCaseToZaakTransformers = {
  [GPP.caseType]: GPP,
  [GPK.caseType]: GPK,
  [BZP.caseType]: BZP,
  [BZB.caseType]: BZB,
  [EigenParkeerplaats.caseType]: EigenParkeerplaats,
  [EigenParkeerplaatsOpheffen.caseType]: EigenParkeerplaatsOpheffen,
  [TouringcarDagontheffing.caseType]: TouringcarDagontheffing,
  [TouringcarJaarontheffing.caseType]: TouringcarJaarontheffing,
} as const;

export const decosZaakTransformers = Object.values(decosCaseToZaakTransformers);
