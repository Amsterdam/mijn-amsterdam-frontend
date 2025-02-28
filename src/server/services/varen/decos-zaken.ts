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
import { isDateInPast } from '../../../universal/helpers/date';
import {
  DecosZaakBase,
  DecosZaakTransformer,
  SELECT_FIELDS_TRANSFORM_BASE,
} from '../decos/decos-types';

const vesselName = { text18: 'vesselName' } as const;
const vesselNameOld = { text33: 'vesselNameOld' } as const;
const vesselLengths = {
  text21: 'vesselLength',
  text22: 'vesselWidth',
  text23: 'vesselHeight',
  text24: 'vesselDepth',
} as const;
const vesselNumberOfSeats = { num8: 'numberOfSeats' } as const;
const vesselSegment = { text10: 'segment' } as const;
const vesselFormAppearance = { text15: 'formAppearance' } as const;
const vesselEniNumber = { text36: 'eniNumber' } as const;
const status = {
  title: {
    name: 'status' as const,
    transform: (title: string) => {
      if (title === 'Afgehandeld') {
        return 'Besluit';
      }
      if (title === 'Ontvangen') {
        return title;
      }
      return 'In behandeling';
    },
  },
};

const fetchMeerInformatieTermijn: Required<DecosZaakTransformer>['fetchTermijnenFor'][number] =
  {
    status: 'Meer informatie nodig',
    type: 'Verzoek aanvullende gegevens',
  };
const fetchInBehandelingWorkflow: Required<DecosZaakTransformer>['fetchWorkflowStatusDatesFor'][number] =
  {
    status: 'In behandeling',
    stepTitle: 'Status bijwerken en notificatie verzenden - Volledigheid toets',
  };

const setStatusIfActiveTermijn = async <T extends DecosZaakBase>(zaak: T) => {
  if (zaak.processed) {
    return zaak;
  }
  const hasActiveTermijn = zaak.termijnDates.find(
    (zaak) => isDateInPast(zaak.dateStart) && !isDateInPast(zaak.dateEnd)
  );
  if (hasActiveTermijn) {
    zaak.status = 'Meer informatie nodig';
  }
  return zaak;
};

const SELECT_FIELDS_TRANSFORM = {
  ...SELECT_FIELDS_TRANSFORM_BASE,
  ...status,
  text96: 'linkDataRequest' as const,
};
export const VarenRegistratieReder: DecosZaakTransformer<VarenRegistratieRederType> =
  {
    isActive: true,
    caseType: 'Varen registratie reder',
    title: 'Varen registratie reder',
    fetchWorkflowStatusDatesFor: [fetchInBehandelingWorkflow],
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
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
    fetchWorkflowStatusDatesFor: [fetchInBehandelingWorkflow],
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
      ...vesselEniNumber,
      text11: 'permitReference',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigenVaartuignaam: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVaartuigNaamType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
    title: 'Wijzigen: Vaartuig een andere naam geven',
    fetchWorkflowStatusDatesFor: [fetchInBehandelingWorkflow],
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      ...vesselNameOld,
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigingVergunningshouder: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVergunningshouderType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vergunninghouder',
    title: 'Wijzigen: Vergunning op naam van een andere onderneming zetten',
    fetchWorkflowStatusDatesFor: [fetchInBehandelingWorkflow],
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselSegment,
      text33: 'statutoryName',
      text34: 'businessAddress',
      text35: 'correspondenceAddress',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigenVerbouwing: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVerbouwingType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging verbouwing',
    title: 'Wijzigen: Vaartuig vervangen door een te (ver)bouwen vaartuig',
    fetchWorkflowStatusDatesFor: [fetchInBehandelingWorkflow],
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigingVervanging: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVervangingType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vervanging',
    title: 'Wijzigen: Vaartuig vervangen door een bestaand vaartuig',
    fetchWorkflowStatusDatesFor: [fetchInBehandelingWorkflow],
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      ...vesselNameOld,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
      ...vesselEniNumber,
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningLigplaats: DecosZaakTransformer<VarenVergunningLigplaatsType> =
  {
    isActive: true,
    caseType: 'Varen ligplaatsvergunning',
    title: 'Varen ligplaatsvergunning',
    fetchWorkflowStatusDatesFor: [fetchInBehandelingWorkflow],
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      text6: 'location',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const decosZaakTransformers = [
  VarenRegistratieReder,
  VarenVergunningExploitatie,
  VarenVergunningLigplaats,
  VarenVergunningExploitatieWijzigenVaartuignaam,
  VarenVergunningExploitatieWijzigenVerbouwing,
  VarenVergunningExploitatieWijzigingVergunningshouder,
  VarenVergunningExploitatieWijzigingVervanging,
];
export const decosCaseToZaakTransformers = decosZaakTransformers.reduce(
  (acc, zaakTransformer) => ({
    ...acc,
    [zaakTransformer.caseType]: zaakTransformer,
  }),
  {} as Record<CaseTypeVaren, DecosZaakTransformer<DecosZaakBase>>
);
