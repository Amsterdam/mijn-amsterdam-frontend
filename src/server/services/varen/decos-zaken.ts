import type {
  DecosVarenZaakVergunning,
  DecosZaakVarensFieldsSource,
  VarenRegistratieRederType,
  VarenVergunningExploitatieType,
  ZaakVergunningExploitatieType,
  ZaakVergunningExploitatieWijzigingVaartuigNaamType,
  ZaakVergunningExploitatieWijzigingVerbouwingType,
  ZaakVergunningExploitatieWijzigingVergunningshouderType,
  ZaakVergunningExploitatieWijzigingVervangingType,
} from './config-and-types';
import {
  dateEnd,
  dateStart,
  SELECT_FIELDS_TRANSFORM_BASE,
} from '../decos/decos-field-transformers';
import { transformFieldValuePairs } from '../decos/decos-service';
import { DecosZaakTransformer } from '../decos/decos-types';
import { dateSort } from '../../../universal/helpers/date';
import { sortAlpha } from '../../../universal/helpers/utils';

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
    caseType: null,
    title: 'Varen vergunning exploitatie',
    transformFields: {
      mark: 'identifier',
      ...vesselSegment,
      ...vesselEniNumber,
      ...vesselLengths,
      subject2: 'vesselName' as const,
      date6: dateStart,
      date7: dateEnd,
    },
    isVerleend: (_zaak) => true,
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

const ZaakBase = {
  itemType: 'folders',
  isActive: true,
  fetchTermijnenFor: [fetchMeerInformatieTermijn],
  transformFields: {
    ...SELECT_FIELDS_TRANSFORM,
    dfunction: 'decision',
    ...vesselName,
    ...vesselLengths,
    ...vesselSegment,
    ...vesselEniNumber,
  },
} satisfies Omit<
  DecosZaakTransformer<ZaakVergunningExploitatieType>,
  'caseType' | 'title'
>;

const ZaakWijzigenBase = {
  ...ZaakBase,
  fetchLinkedItem: ['varens'],
  transformFields: {
    ...ZaakBase.transformFields,
    varens: {
      name: 'vergunningen',
      transform: (vergunningen: DecosZaakVarensFieldsSource[] | null) =>
        (vergunningen || [])
          .map((vergunning) =>
            transformFieldValuePairs<VarenVergunningExploitatieType>(
              VarenVergunningExploitatie.transformFields,
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
    ...ZaakBase,
  };

export const ZaakVergunningExploitatieWijzigenVaartuignaam: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVaartuigNaamType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vaartuignaam',
    title: 'Wijzigen: Vaartuig een andere naam geven',
    ...ZaakWijzigenBase,
    transformFields: {
      ...ZaakWijzigenBase.transformFields,
      text33: 'vesselName',
      text18: 'vesselNameNew',
    },
  };

export const ZaakVergunningExploitatieWijzigingVergunningshouder: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVergunningshouderType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vergunninghouder',
    title: 'Wijzigen: Vergunning op naam van een andere onderneming zetten',
    ...ZaakWijzigenBase,
    transformFields: {
      ...ZaakWijzigenBase.transformFields,
      text34: 'statutoryName',
      text35: 'businessAddress',
      text36: 'correspondenceAddress',
    },
    async afterTransform(decosZaak, _decosZaakSource) {
      const hasMultipleVergunningen = decosZaak.vergunningen?.length > 1;
      if (!hasMultipleVergunningen) {
        return decosZaak;
      }
      // There can be multiple linked vergunningen
      // The earliest vergunning belongs to the current reder and is returned
      // If dateStart is not correctly set we fallback to sorting based on the identifier
      let vergunningen = decosZaak.vergunningen;
      const allHaveDateStart = decosZaak.vergunningen.every(
        (z) => !!z.dateStart
      );
      const allHaveUniqueDateStart =
        new Set(vergunningen.map((z) => z.dateStart)).size ===
        vergunningen.length;

      const sortFn =
        allHaveDateStart && allHaveUniqueDateStart
          ? dateSort('dateStart', 'asc')
          : sortAlpha('identifier', 'asc');

      return {
        ...decosZaak,
        vergunningen: [vergunningen.sort(sortFn)[0]],
      };
    },
  };

export const ZaakVergunningExploitatieWijzigenVerbouwing: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVerbouwingType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging verbouwing',
    title: 'Wijzigen: Vaartuig verbouwen',
    ...ZaakWijzigenBase,
  };

export const ZaakVergunningExploitatieWijzigingVervanging: DecosZaakTransformer<ZaakVergunningExploitatieWijzigingVervangingType> =
  {
    caseType: 'Varen vergunning exploitatie Wijziging vervanging',
    title: 'Wijzigen: Vaartuig vervangen',
    ...ZaakWijzigenBase,
    transformFields: {
      ...ZaakWijzigenBase.transformFields,
      text33: 'vesselName',
      text18: 'vesselNameNew',
    },
  };

export const decosRederZaakTransformers = [ZaakRegistratieReder];
export const decosVergunningTransformers = [VarenVergunningExploitatie];
export const decosZaakTransformers = [
  ZaakVergunningExploitatie,
  ZaakVergunningExploitatieWijzigenVaartuignaam,
  ZaakVergunningExploitatieWijzigenVerbouwing,
  ZaakVergunningExploitatieWijzigingVergunningshouder,
  ZaakVergunningExploitatieWijzigingVervanging,
];
