import type {
  CaseTypeVaren,
  DecosZaakVarensFieldsSource,
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
import { transformFieldValuePairs } from '../decos/decos-service';
import {
  DecosZaakBase,
  DecosZaakTransformer,
  SELECT_FIELDS_TRANSFORM_BASE,
} from '../decos/decos-types';

const vesselName = { text18: 'vesselName' } as const;
const vesselLengths = {
  text21: 'vesselLength',
  text22: 'vesselWidth',
} as const;
const vesselSegment = { text10: 'segment' } as const;
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

const VarenBaseExploitatieVergunning = {
  isActive: true,
  fetchTermijnenFor: [fetchMeerInformatieTermijn],
  fetchLinkedItem: ['varens'],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM,
    dfunction: {
      name: 'decision' as const,
      transform: (dfunction) => (dfunction === 'Verleend' ? dfunction : null),
    },
    ...vesselName,
    ...vesselLengths,
    ...vesselSegment,
    ...vesselEniNumber,
    varens: {
      name: 'vergunningen',
      transform: (vergunningen: DecosZaakVarensFieldsSource[] | null) =>
        (vergunningen || [])
          .map((vergunning) =>
            transformFieldValuePairs<VarenVergunningExploitatieType>(
              {
                ...vesselLengths,
                ...vesselSegment,
                ...vesselEniNumber,
                mark: 'identifier',
                subject2: 'vesselName' as const,
              },
              vergunning
            )
          )
          .map((vergunning) => ({
            id:
              vergunning.identifier?.replace(/\//g, '-') ??
              'unknown-decoszaak-id',
            ...vergunning,
          })),
    },
  },
  afterTransform: setStatusIfActiveTermijn,
} satisfies Omit<
  DecosZaakTransformer<VarenVergunningExploitatieType>,
  'caseType' | 'title'
>;

export const VarenVergunningExploitatie: DecosZaakTransformer<VarenVergunningExploitatieType> =
  {
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    ...VarenBaseExploitatieVergunning,
  };

export const VarenVergunningExploitatieWijzigenVaartuignaam: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVaartuigNaamType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
    title: 'Wijzigen: Vaartuig een andere naam geven',
    ...VarenBaseExploitatieVergunning,
    transformFields: {
      ...VarenBaseExploitatieVergunning.transformFields,
      text18: 'vesselNameNew',
    },
  };

export const VarenVergunningExploitatieWijzigingVergunningshouder: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVergunningshouderType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vergunninghouder',
    title: 'Wijzigen: Vergunning op naam van een andere onderneming zetten',
    ...VarenBaseExploitatieVergunning,
    transformFields: {
      ...VarenBaseExploitatieVergunning.transformFields,
      text33: 'statutoryName',
      text34: 'businessAddress',
      text35: 'correspondenceAddress',
    },
  };

export const VarenVergunningExploitatieWijzigenVerbouwing: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVerbouwingType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging verbouwing',
    title: 'Wijzigen: Vaartuig vervangen door een te (ver)bouwen vaartuig',
    ...VarenBaseExploitatieVergunning,
  };

export const VarenVergunningExploitatieWijzigingVervanging: DecosZaakTransformer<VarenVergunningExploitatieWijzigingVervangingType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vervanging',
    title: 'Wijzigen: Vaartuig vervangen door een bestaand vaartuig',
    ...VarenBaseExploitatieVergunning,
    transformFields: {
      ...VarenBaseExploitatieVergunning.transformFields,
      text18: 'vesselNameNew',
    },
  };

export const VarenVergunningLigplaats: DecosZaakTransformer<VarenVergunningLigplaatsType> =
  {
    caseType: 'Varen ligplaatsvergunning',
    title: 'Varen ligplaatsvergunning',
    ...VarenBaseExploitatieVergunning,
    transformFields: {
      ...VarenBaseExploitatieVergunning.transformFields,
      text6: 'location',
    },
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
