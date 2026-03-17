import {
  caseTypePB,
  type Omzettingsvergunning,
  type Onttrekkingsvergunning,
  type OnttrekkingsvergunningSloop,
  type Samenvoegingsvergunning,
  type Splitsingsvergunning,
  type OnttrekkingsvergunningTweedeWoning,
  type VormenVanWoonruimte,
  type LigplaatsWoonbootvergunning,
  type LigplaatsBedrijfsvaartuigvergunning,
} from './config-and-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../powerbrowser/powerbrowser-field-transformers';
import {
  hasCaseTypeInFMT_CAPTION,
  hasStringInZAAK_SUBPRODUCT_ID,
  hasStringInZAAKPRODUCT_ID,
} from '../powerbrowser/powerbrowser-helpers';
import { PowerBrowserZaakTransformer } from '../powerbrowser/powerbrowser-types';

function isValidPBDocumentForVTH(record: {
  SOORTDOCUMENT_ID: string;
  STAMCSSTATUS_ID: string;
}) {
  const isAanvraag = record.SOORTDOCUMENT_ID === '1000001015';
  const isBesluit = record.SOORTDOCUMENT_ID === '256';
  const isDefinitief = record.STAMCSSTATUS_ID === '1000001002';

  const isValid = isDefinitief && (isBesluit || isAanvraag);
  return isValid;
}

export const documentNamesMA = {
  TOEKENNING: 'Besluit toekenning',
  VERLENGING: 'Besluit verlenging beslistermijn',
  WEIGERING: 'Besluit weigering',
  BUITEN_BEHANDELING: 'Besluit Buiten behandeling',
  INTREKKING: 'Besluit intrekking',
  MEER_INFORMATIE: 'Verzoek aanvullende gegevens',
  SAMENVATTING: 'Samenvatting aanvraagformulier',
  BESLUIT: 'Besluiten en vastleggen',
} as const;

const LigplaatsWoonbootVergunningZaakTransformer: PowerBrowserZaakTransformer<LigplaatsWoonbootvergunning> =
  {
    caseType: caseTypePB.LigplaatsWoonbootvergunning,
    title: 'Ligplaatsvergunning woonboot',
    fetchZaakIdFilter: (pbRecordField) =>
      hasStringInZAAKPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning woonboot'
      ) ||
      hasStringInZAAK_SUBPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning woonboot'
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    // TODO: MIJN-12348 - Replace with actual document names and add mock data
    transformDoclinks: {
      [documentNamesMA.BESLUIT]: ['Besluit'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const LigplaatsBedrijfsvaartuigVergunningZaakTransformer: PowerBrowserZaakTransformer<LigplaatsBedrijfsvaartuigvergunning> =
  {
    caseType: caseTypePB.LigplaatsBedrijfsvaartuigvergunning,
    title: 'Ligplaatsvergunning bedrijfsvaartuig',
    fetchZaakIdFilter: (pbRecordField) =>
      hasStringInZAAKPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning bedrijfsvaartuig'
      ) ||
      hasStringInZAAK_SUBPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning bedrijfsvaartuig'
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    // TODO: MIJN-12348 - Replace with actual document names and add mock data
    transformDoclinks: {
      [documentNamesMA.BESLUIT]: ['Besluit'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const OmzettingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Omzettingsvergunning> =
  {
    caseType: caseTypePB.Omzettingsvergunning,
    title: 'Vergunning voor kamerverhuur (omzettingsvergunning)',
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, 'Omzetting kamerverhuur'),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformDoclinks: {
      // TODO: MIJN-12348 - Replace with actual document names and add mock data
      [documentNamesMA.BESLUIT]: ['Besluit'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const SamenvoegingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Samenvoegingsvergunning> =
  {
    caseType: caseTypePB.Samenvoegingsvergunning,
    title: 'Vergunning voor samenvoegen van woonruimten',
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, 'Vergunning voor samenvoegen'),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformDoclinks: {
      // TODO: MIJN-12348 - Replace with actual document names and add mock data
      [documentNamesMA.BESLUIT]: ['Besluit'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const OnttrekkingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Onttrekkingsvergunning> =
  {
    caseType: caseTypePB.Onttrekkingsvergunning,
    title: caseTypePB.Onttrekkingsvergunning,
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        OnttrekkingsvergunningZaakTransformer.title
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const OnttrekkingsvergunningSloopZaakTransformer: PowerBrowserZaakTransformer<OnttrekkingsvergunningSloop> =
  {
    caseType: caseTypePB.OnttrekkingsvergunningSloop,
    title: caseTypePB.OnttrekkingsvergunningSloop,
    fetchZaakIdFilter: (pbRecordField) =>
      // Powerbrowser currently uses a misspelled name, we also check the correct spelling in case this is ever changed
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        OnttrekkingsvergunningZaakTransformer.title
      ) ||
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        'Ontrekkingsvergunning voor sloop'
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const VormenVanWoonruimteZaakTransformer: PowerBrowserZaakTransformer<VormenVanWoonruimte> =
  {
    caseType: caseTypePB.VormenVanWoonruimte,
    title: 'Vergunning voor woningvorming',
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, 'Vergunning voor woningvormen'),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const OnttrekkingsvergunningTweedeWoningZaakTransformer: PowerBrowserZaakTransformer<OnttrekkingsvergunningTweedeWoning> =
  {
    caseType: caseTypePB.OnttrekkingsvergunningTweedeWoning,
    title: 'Voorraadvergunning tweede woning',
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        OnttrekkingsvergunningTweedeWoningZaakTransformer.title
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

const SplitsingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Splitsingsvergunning> =
  {
    caseType: caseTypePB.Splitsingsvergunning,
    title: caseTypePB.Splitsingsvergunning,
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        SplitsingsvergunningZaakTransformer.title
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    filterValidDocumentPredicate: isValidPBDocumentForVTH,
  };

export const pbZaakTransformers = [
  OmzettingsvergunningZaakTransformer,
  LigplaatsWoonbootVergunningZaakTransformer,
  LigplaatsBedrijfsvaartuigVergunningZaakTransformer,
  SplitsingsvergunningZaakTransformer,
  SamenvoegingsvergunningZaakTransformer,
  VormenVanWoonruimteZaakTransformer,
  OnttrekkingsvergunningZaakTransformer,
  OnttrekkingsvergunningSloopZaakTransformer,
  OnttrekkingsvergunningTweedeWoningZaakTransformer,
];

export const pbCaseToZaakTransformers = pbZaakTransformers.reduce<
  Record<string, PowerBrowserZaakTransformer>
>((acc, t) => ({ ...acc, [t.caseType]: t }), {});
