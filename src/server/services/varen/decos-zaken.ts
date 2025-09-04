import type {
  DecosZaakVarensFieldsSource,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
  ZaakVergunningExploitatieType,
  ZaakVergunningExploitatieWijzigingVaartuigNaamType,
  ZaakVergunningExploitatieWijzigingVerbouwingType,
  ZaakVergunningExploitatieWijzigingVergunningshouderType,
  ZaakVergunningExploitatieWijzigingVervangingType,
} from './config-and-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../decos/decos-field-transformers';
import { transformFieldValuePairs } from '../decos/decos-service';
import { DecosZaakTransformer } from '../decos/decos-types';

const vesselName = { text18: 'vesselName' } as const;
const vesselLengths = {
  text21: 'vesselLength',
  text22: 'vesselWidth',
} as const;
const vesselSegment = { text10: 'segment' } as const;
const vesselEniNumber = { text36: 'eniNumber' } as const;

const fetchMeerInformatieTermijn: Required<DecosZaakTransformer>['fetchTermijnenFor'][number] =
  {
    status: 'Meer informatie nodig',
    type: 'Verzoek aanvullende gegevens',
  };

const SELECT_FIELDS_TRANSFORM = {
  ...SELECT_FIELDS_TRANSFORM_BASE,
  text96: 'linkDataRequest' as const,
};

export const VarenVergunningExploitatie: DecosZaakTransformer<VarenVergunningExploitatieType> =
  {
    isActive: true,
    itemType: 'varens',
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM,
    },
  };

export const ZaakRegistratieReder: DecosZaakTransformer<VarenRegistratieRederType> =
  {
    isActive: true,
    itemType: 'folders',
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
  };

const ZaakVergunningExploitatieBase = {
  itemType: 'folders',
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
            transformFieldValuePairs<ZaakVergunningExploitatieType>(
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
              vergunning.identifier?.replaceAll('/', '-') ??
              'unknown-decoszaak-id',
            ...vergunning,
          })),
    },
  },
} satisfies Omit<
  DecosZaakTransformer<ZaakVergunningExploitatieType>,
  'caseType' | 'title'
>;

export const ZaakVergunningExploitatie: DecosZaakTransformer<ZaakVergunningExploitatieType> =
  {
    caseType: 'Varen vergunning exploitatie',
    title: 'Varen vergunning exploitatie',
    ...ZaakVergunningExploitatieBase,
  };

export const ZaakVergunningExploitatieWijzigenVaartuignaam: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVaartuigNaamType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
    title: 'Wijzigen: Vaartuig een andere naam geven',
    ...ZaakVergunningExploitatieBase,
    transformFields: {
      ...ZaakVergunningExploitatieBase.transformFields,
      text33: 'vesselName',
      text18: 'vesselNameNew',
    },
  };

export const ZaakVergunningExploitatieWijzigingVergunningshouder: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVergunningshouderType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vergunninghouder',
    title: 'Wijzigen: Vergunning op naam van een andere onderneming zetten',
    ...ZaakVergunningExploitatieBase,
    transformFields: {
      ...ZaakVergunningExploitatieBase.transformFields,
      text33: 'statutoryName',
      text34: 'businessAddress',
      text35: 'correspondenceAddress',
    },
  };

export const ZaakVergunningExploitatieWijzigenVerbouwing: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVerbouwingType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging verbouwing',
    title: 'Wijzigen: Vaartuig vervangen door een te (ver)bouwen vaartuig',
    ...ZaakVergunningExploitatieBase,
  };

export const ZaakVergunningExploitatieWijzigingVervanging: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVervangingType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vervanging',
    title: 'Wijzigen: Vaartuig vervangen door een bestaand vaartuig',
    ...ZaakVergunningExploitatieBase,
    transformFields: {
      ...ZaakVergunningExploitatieBase.transformFields,
      text33: 'vesselName',
      text18: 'vesselNameNew',
    },
  };

const decosCaseToZaakTransformers = [
  ZaakRegistratieReder,
  VarenVergunningExploitatie,
  ZaakVergunningExploitatie,
  ZaakVergunningExploitatieWijzigenVaartuignaam,
  ZaakVergunningExploitatieWijzigenVerbouwing,
  ZaakVergunningExploitatieWijzigingVergunningshouder,
  ZaakVergunningExploitatieWijzigingVervanging,
];

export const decosZaakTransformers = decosCaseToZaakTransformers;
