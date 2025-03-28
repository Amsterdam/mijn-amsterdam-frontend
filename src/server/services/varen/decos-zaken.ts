import type {
  VarenRegistratieRederType,
  VarenStatus,
  VarenVergunningExploitatieType,
  VarenVergunningExploitatieWijzigingVaartuigNaamType,
  VarenVergunningExploitatieWijzigingVerbouwingType,
  VarenVergunningExploitatieWijzigingVergunningshouderType,
  VarenVergunningExploitatieWijzigingVervangingType,
  VarenVergunningLigplaatsType,
} from './config-and-types';
import { isDateInPast } from '../../../universal/helpers/date';
import { DecosZaakTransformer, DecosZaakBase } from '../decos/config-and-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../decos/decos-field-transformers';

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
    transform: (title: string): VarenStatus => {
      if (title === 'Afgehandeld') {
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

const setStatusIfActiveTermijn = async <T extends DecosZaakBase>(zaak: T) => {
  if (zaak.processed) {
    return zaak;
  }
  const hasActiveTermijn = !!zaak.termijnDates?.find(
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
      text35: 'correspondenceAddress',
    },
    notificationLabels: {},
  };

export const VarenVergunningExploitatie: DecosZaakTransformer<VarenVergunningExploitatieType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
      ...vesselEniNumber,
      country: 'permitReference',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigenVaartuignaam: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVaartuigNaamType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
    title: 'Wijzigen: Vaartuig een andere naam geven',
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      ...vesselNameOld,
      country: 'permitReference',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigingVergunningshouder: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVergunningshouderType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vergunninghouder',
    title: 'Wijzigen: Vergunning op naam van een andere onderneming zetten',
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselSegment,
      text33: 'statutoryName',
      text34: 'businessAddress',
      text35: 'correspondenceAddress',
      country: 'permitReference',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigenVerbouwing: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVerbouwingType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging verbouwing',
    title: 'Wijzigen: Vaartuig vervangen door een te (ver)bouwen vaartuig',
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      ...vesselLengths,
      ...vesselNumberOfSeats,
      ...vesselSegment,
      ...vesselFormAppearance,
      country: 'permitReference',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningExploitatieWijzigingVervanging: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVervangingType> =
  {
    isActive: true,
    caseType: 'Varen vergunning exploitatie Wijziging vervanging',
    title: 'Wijzigen: Vaartuig vervangen door een bestaand vaartuig',
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
      country: 'permitReference',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const VarenVergunningLigplaats: DecosZaakTransformer<VarenVergunningLigplaatsType> =
  {
    isActive: true,
    caseType: 'Varen ligplaatsvergunning',
    title: 'Varen ligplaatsvergunning',
    fetchTermijnenFor: [fetchMeerInformatieTermijn],
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
      ...vesselName,
      text6: 'location',
    },
    afterTransform: setStatusIfActiveTermijn,
    notificationLabels: {},
  };

export const decosCaseToZaakTransformers = {
  [VarenRegistratieReder.caseType]: VarenRegistratieReder,
  [VarenVergunningExploitatie.caseType]: VarenVergunningExploitatie,
  [VarenVergunningLigplaats.caseType]: VarenVergunningLigplaats,
  [VarenVergunningExploitatieWijzigenVaartuignaam.caseType]:
    VarenVergunningExploitatieWijzigenVaartuignaam,
  [VarenVergunningExploitatieWijzigenVerbouwing.caseType]:
    VarenVergunningExploitatieWijzigenVerbouwing,
  [VarenVergunningExploitatieWijzigingVergunningshouder.caseType]:
    VarenVergunningExploitatieWijzigingVergunningshouder,
  [VarenVergunningExploitatieWijzigingVervanging.caseType]:
    VarenVergunningExploitatieWijzigingVervanging,
} as const;

export const decosZaakTransformers = Object.values(decosCaseToZaakTransformers);
