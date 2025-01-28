import { parseISO } from 'date-fns';

import {
  BZB as BZBType,
  BZP as BZPType,
  EigenParkeerplaatsOpheffen as EigenParkeerplaatsOpheffenType,
  EigenParkeerplaatsRequestType,
  EigenParkeerplaats as EigenParkeerplaatsType,
  GPK as GPKType,
  GPP as GPPType,
  TouringcarDagontheffing as TouringcarDagontheffingType,
  TouringcarJaarontheffing as TouringcarJaarontheffingType,
} from './config-and-types';
import { CaseTypeV2 } from '../../../universal/types/decos-zaken';
import { DecosZaakTransformer } from '../decos/config-and-types';
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
  getDecosZaakTransformersByCaseType,
  transformBoolean,
} from '../decos/decos-helpers';
import {
  caseNotificationLabelsDefault,
  caseNotificationLabelsExpirables,
} from '../vergunningen/vergunningen-notification-labels';

export const GPP: DecosZaakTransformer<GPPType> = {
  isActive: true,
  caseType: CaseTypeV2.GPP,
  title: 'Vaste parkeerplaats voor gehandicapten (GPP)',
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    dfunction: transformDecision({
      Ingetrokken: ['Ingetrokken i.v.m. overlijden of verhuizing'],
      '': ['Nog niet bekend'],
    }),
    text7: kentekens,
    text8: location,
  },
  async afterTransform(vergunning) {
    vergunning.title = getCustomTitleForDecosZaakWithLicensePlates(vergunning);
    return vergunning;
  },
  notificationLabels: caseNotificationLabelsDefault,
};

export const GPK: DecosZaakTransformer<GPKType> = {
  isActive: true,
  caseType: CaseTypeV2.GPK,
  title: 'Europese gehandicaptenparkeerkaart (GPK)',
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
    date7: dateEnd,
    num3: { name: 'cardNumber' },
    text7: { name: 'cardType' },
  },
  notificationLabels: caseNotificationLabelsExpirables,
};

export const BZP: DecosZaakTransformer<BZPType> = {
  isActive: true,
  caseType: CaseTypeV2.BZP,
  title: CaseTypeV2.BZP,
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
  notificationLabels: caseNotificationLabelsExpirables,
};

export const BZB: DecosZaakTransformer<BZBType> = {
  isActive: true,
  caseType: CaseTypeV2.BZB,
  title: CaseTypeV2.BZB,
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM_BASE,
    date6: dateStart,
    date7: dateEnd,
    company: { name: 'companyName' },
    num6: { name: 'numberOfPermits' },
  },
  notificationLabels: caseNotificationLabelsDefault,
};

export const EigenParkeerplaats: DecosZaakTransformer<EigenParkeerplaatsType> =
  {
    isActive: true,
    caseType: CaseTypeV2.EigenParkeerplaats,
    title: CaseTypeV2.EigenParkeerplaats,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Status bijwerken en notificatie verzenden - In behandeling',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      date6: dateStart,
      date8: dateEnd,
      text13: kentekens,
      text14: { ...kentekens, name: 'vorigeKentekens' },
    },
    requirePayment: true,
    hasValidSourceData: (decosZaak) => {
      const dateNotBefore = new Date('2023-08-08');
      const dateRequest = parseISO(decosZaak.fields.document_date);

      return dateRequest >= dateNotBefore;
    },
    async afterTransform(vergunning, zaakSource) {
      vergunning.title =
        getCustomTitleForDecosZaakWithLicensePlates(vergunning);

      const locations: (typeof vergunning)['locations'] = [];

      if (zaakSource.fields.text25) {
        locations.push({
          type: String(zaakSource.fields.text17),
          street: String(zaakSource.fields.tex25),
          houseNumber: `${zaakSource.fields.num14 ?? ''}`,
          fiscalNumber: String(zaakSource.fields.text18),
          url: String(zaakSource.fields.text19),
        });
      }

      if (zaakSource.fields.streetLocation2) {
        locations.push({
          type: String(zaakSource.fields.text20),
          street: String(zaakSource.fields.text15),
          houseNumber: `${zaakSource.fields.num15 ?? ''}`,
          fiscalNumber: String(zaakSource.fields.text21),
          url: String(zaakSource.fields.text22),
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
    notificationLabels: caseNotificationLabelsExpirables,
  };

export const EigenParkeerplaatsOpheffen: DecosZaakTransformer<EigenParkeerplaatsOpheffenType> =
  {
    isActive: true,
    caseType: CaseTypeV2.EigenParkeerplaatsOpheffen,
    title: CaseTypeV2.EigenParkeerplaatsOpheffen,
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Status bijwerken en notificatie verzenden - In behandeling',
      },
    ],
    requirePayment: true,
    hasValidSourceData: EigenParkeerplaats.hasValidSourceData,
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      bol8: 'isCarsharingpermit',
      date8: 'dateEnd',
    },
    async afterTransform(vergunning, zaakSource) {
      vergunning.location = {
        street: String(zaakSource.fields.text25),
        houseNumber: String(zaakSource.fields.num14),
        type: String(zaakSource.fields.text17),
        url: String(zaakSource.fields.tex19),
        fiscalNumber: String(zaakSource.fields.tex18),
      };
      return vergunning;
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const TouringcarDagontheffing: DecosZaakTransformer<TouringcarDagontheffingType> =
  {
    isActive: true,
    caseType: CaseTypeV2.TouringcarDagontheffing,
    title: CaseTypeV2.TouringcarDagontheffing,
    fetchWorkflowStatusDatesFor: [
      { status: 'In behandeling', stepTitle: 'Status naar in behandeling' },
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
      vergunning.title =
        getCustomTitleForDecosZaakWithLicensePlates(vergunning);
      return vergunning;
    },
    notificationLabels: caseNotificationLabelsDefault,
  };

export const TouringcarJaarontheffing: DecosZaakTransformer<TouringcarJaarontheffingType> =
  {
    isActive: true,
    caseType: CaseTypeV2.TouringcarJaarontheffing,
    title: CaseTypeV2.TouringcarJaarontheffing,
    fetchWorkflowStatusDatesFor: [
      { status: 'In behandeling', stepTitle: 'Status naar In Behandeling' },
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
        vergunning.title = 'Touringcar jaarontheffing met routetoets';
      } else {
        vergunning.title =
          getCustomTitleForDecosZaakWithLicensePlates(vergunning);
      }
      return vergunning;
    },
    notificationLabels: caseNotificationLabelsExpirables,
  };

export const decosZaakTransformers = [
  GPP,
  GPK,
  BZP,
  BZB,
  EigenParkeerplaats,
  EigenParkeerplaatsOpheffen,
  TouringcarDagontheffing,
  TouringcarJaarontheffing,
];

export const decosCaseToZaakTransformers = getDecosZaakTransformersByCaseType(
  decosZaakTransformers
);
