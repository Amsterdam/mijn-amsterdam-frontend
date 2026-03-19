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
import {
  PowerBrowserZaakTransformer,
  type PBRecordField,
} from '../powerbrowser/powerbrowser-types';
import {
  isValidVTHZaak,
  isValidVTHDocument,
  transformVTHZaakResult,
} from './VTH/pb-zaken-vth-helpers';

const LigplaatsWoonbootVergunningZaakTransformer: PowerBrowserZaakTransformer<LigplaatsWoonbootvergunning> =
  {
    caseType: caseTypePB.LigplaatsWoonbootvergunning,
    title: 'Ligplaatsvergunning woonboot',
    fetchZaakFilter: (pbRecordField) => {
      const isOldZaak = hasStringInZAAKPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning woonboot'
      );
      const isNewZaak = hasStringInZAAK_SUBPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning woonboot'
      );
      return (isOldZaak || isNewZaak) && isValidVTHZaak(pbRecordField);
    },
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const LigplaatsBedrijfsvaartuigVergunningZaakTransformer: PowerBrowserZaakTransformer<LigplaatsBedrijfsvaartuigvergunning> =
  {
    caseType: caseTypePB.LigplaatsBedrijfsvaartuigvergunning,
    title: 'Ligplaatsvergunning bedrijfsvaartuig',
    fetchZaakFilter: (pbRecordField) =>
      hasStringInZAAKPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning bedrijfsvaartuig'
      ) ||
      hasStringInZAAK_SUBPRODUCT_ID(
        pbRecordField,
        'Ligplaatsvergunning bedrijfsvaartuig'
      ),
    transformFields: SELECT_FIELDS_TRANSFORM_BASE,
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const OmzettingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Omzettingsvergunning> =
  {
    caseType: caseTypePB.Omzettingsvergunning,
    title: 'Vergunning voor kamerverhuur (omzettingsvergunning)',
    fetchZaakFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, 'Omzetting kamerverhuur'),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const SamenvoegingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Samenvoegingsvergunning> =
  {
    caseType: caseTypePB.Samenvoegingsvergunning,
    title: 'Vergunning voor samenvoegen van woonruimten',
    fetchZaakFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, 'Vergunning voor samenvoegen'),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const OnttrekkingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Onttrekkingsvergunning> =
  {
    caseType: caseTypePB.Onttrekkingsvergunning,
    title: caseTypePB.Onttrekkingsvergunning,
    fetchZaakFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        OnttrekkingsvergunningZaakTransformer.title
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const OnttrekkingsvergunningSloopZaakTransformer: PowerBrowserZaakTransformer<OnttrekkingsvergunningSloop> =
  {
    caseType: caseTypePB.OnttrekkingsvergunningSloop,
    title: caseTypePB.OnttrekkingsvergunningSloop,
    fetchZaakFilter: (pbRecordField) =>
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
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const VormenVanWoonruimteZaakTransformer: PowerBrowserZaakTransformer<VormenVanWoonruimte> =
  {
    caseType: caseTypePB.VormenVanWoonruimte,
    title: 'Vergunning voor woningvorming',
    fetchZaakFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, 'Vergunning voor woningvormen'),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const OnttrekkingsvergunningTweedeWoningZaakTransformer: PowerBrowserZaakTransformer<OnttrekkingsvergunningTweedeWoning> =
  {
    caseType: caseTypePB.OnttrekkingsvergunningTweedeWoning,
    title: 'Voorraadvergunning tweede woning',
    fetchZaakFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        OnttrekkingsvergunningTweedeWoningZaakTransformer.title
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const SplitsingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Splitsingsvergunning> =
  {
    caseType: caseTypePB.Splitsingsvergunning,
    title: caseTypePB.Splitsingsvergunning,
    fetchZaakFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        SplitsingsvergunningZaakTransformer.title
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
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
].map((t) => ({
  ...t,
  fetchZaakFilter: (field: PBRecordField) =>
    t.fetchZaakFilter?.(field) && isValidVTHZaak(field),
}));

export const pbCaseToZaakTransformers = pbZaakTransformers.reduce<
  Record<string, PowerBrowserZaakTransformer>
>((acc, t) => ({ ...acc, [t.caseType]: t }), {});
