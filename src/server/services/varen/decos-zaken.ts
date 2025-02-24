import type {
  CaseTypeVaren,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
  VarenVergunningExploitatieWijzigingVaartuigNaamType,
  VarenVergunningExploitatieWijzigingVerbouwingType,
  VarenVergunningExploitatieWijzigingVergunningshouderType,
  VarenVergunningExploitatieWijzigingVervangingType,
  VarenVergunningLigplaatsType,
} from './config-and-types';
import {
  DecosZaakBase,
  DecosZaakTransformer,
  SELECT_FIELDS_TRANSFORM_BASE,
} from '../decos/decos-types';

const vesselName = { text18: 'vesselName' } as const;
const vesselLengths = {
  text21: 'vesselLength',
  text22: 'vesselWidth',
  text23: 'vesselHeight',
  text24: 'vesselDepth',
} as const;
const vesselNumberOfSeats = { num8: 'numberOfSeats' } as const;
const vesselSegment = { text10: 'segment' } as const;
const vesselFormAppearance = { text15: 'formAppearance' } as const;
const vesselEniNumber = { num10: 'eniNumber' } as const;

export const VarenRegistratieReder: DecosZaakTransformer<VarenRegistratieRederType> =
  {
    isActive: true,
    caseType: 'Varen registratie reder',
    title: 'Varen registratie reder',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      company: 'company',
      num2: 'bsnkvk',
      mailaddress: 'address',
      zipcode: 'postalCode',
      city: 'city',
      phone1: 'phone',
      email1: 'email',
    },
    notificationLabels: {},
  };

export const VarenVergunningExploitatie: DecosZaakTransformer<VarenVergunningExploitatieType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    fetchWorkflowStatusDatesFor: [
      {
        status: 'In behandeling',
        stepTitle: 'Status bijwerken en notificatie verzenden - Ontvangen',
      },
      {
        status: 'Inhoudelijke toets',
        stepTitle:
          'Status bijwerken en notificatie verzenden - Inhoudelijke toets',
      },
      {
        status: 'Volledigheid toets',
        stepTitle:
          'Status bijwerken en notificatie verzenden - Volledigheid toets',
      },
    ],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      ...vesselName,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
      ...vesselEniNumber,
      text11: 'permitReference',
    },
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigenVaartuignaam: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVaartuigNaamType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
    title: 'Wijzigen: Vaartuig een andere naam geven',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text18: 'vesselName',
      text33: 'vesselNameOld',
    },
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigingVergunningshouder: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVergunningshouderType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vergunninghouder',
    title: 'Wijzigen: Vergunning op naam van een andere onderneming zetten',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      ...vesselSegment,
      text33: 'statutoryName',
      text34: 'businessAddress',
      text35: 'correspondenceAddress',
    },
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigenVerbouwing: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVerbouwingType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging verbouwing',
    title: 'Wijzigen: Vaartuig vervangen door een te (ver)bouwen vaartuig',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      ...vesselName,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
    },
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigingVervanging: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVervangingType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vervanging',
    title: 'Wijzigen: Vaartuig vervangen door een bestaand vaartuig',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      ...vesselName,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
      ...vesselEniNumber,
    },
    notificationLabels: {},
  };

export const VarenVergunningLigplaats: DecosZaakTransformer<VarenVergunningLigplaatsType> =
  {
    isActive: true,
    caseType: 'Varen ligplaatsvergunning',
    title: 'Varen ligplaatsvergunning',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      ...vesselName,
      text6: 'location',
    },
    notificationLabels: {},
  };

export const decosZaakTransformers = [
  VarenRegistratieReder,
  VarenVergunningExploitatie,
  VarenVergunningLigplaats,
  VarenVergunningExploitatieWijzigenVaartuignaam,
];
export const decosCaseToZaakTransformers = decosZaakTransformers.reduce(
  (acc, zaakTransformer) => ({
    ...acc,
    [zaakTransformer.caseType]: zaakTransformer,
  }),
  {} as Record<CaseTypeVaren, DecosZaakTransformer<DecosZaakBase>>
);
