import {
  caseTypePB,
  type Omzettingsvergunning,
  type Onttrekkingsvergunning,
  type OnttrekkingsvergunningSloop,
  type Samenvoegingsvergunning,
  type Splitsingsvergunning,
  type OnttrekkingsvergunningTweedeWoning,
  type VormenVanWoonruimte,
  type LigplaatsBedrijfsvaartuigvergunning,
  type LigplaatsWoonbootvergunning,
} from './config-and-types.ts';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../powerbrowser/powerbrowser-field-transformers.ts';
import {
  hasCaseTypeInFMT_CAPTION,
  hasStringInZAAK_SUBPRODUCT_ID,
  hasStringInZAAKPRODUCT_ID,
} from '../powerbrowser/powerbrowser-helpers.ts';
import type {
  PBZaakFieldsByName,
  PowerBrowserZaakTransformer,
} from '../powerbrowser/powerbrowser-types.ts';
import {
  isValidVTHZaak,
  isValidVTHDocument,
  isVTHZaakVerleend,
  transformVTHZaakResult,
} from './VTH/pb-zaken-vth-helpers.ts';

const LigplaatsWoonbootVergunningZaakTransformer: PowerBrowserZaakTransformer<LigplaatsWoonbootvergunning> =
  {
    caseType: caseTypePB.LigplaatsWoonbootvergunning,
    title: 'Ligplaatsvergunning woonboot',
    isVerleend: isVTHZaakVerleend,
    fetchWbTransportFields: {
      prefix: 'WB_',
      fields: ['NAAM_VAARTUIG', 'DIEPGANG', 'LENGTE', 'BREEDTE', 'HOOGTE'],
    },
    fetchZaakFilter: (pbZaakFields) =>
      hasStringInZAAKPRODUCT_ID('Ligplaatsvergunning woonboot', pbZaakFields) ||
      hasStringInZAAK_SUBPRODUCT_ID(
        'Ligplaatsvergunning woonboot',
        pbZaakFields
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      WB_NAAM_VAARTUIG: 'vaartuigNaam',
      WB_DIEPGANG: 'diepgang',
      WB_LENGTE: 'lengte',
      WB_BREEDTE: 'breedte',
      WB_HOOGTE: 'hoogte',
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
    isVerleend: isVTHZaakVerleend,
    fetchWbTransportFields: {
      prefix: 'WB_',
      fields: ['NAAM_VAARTUIG', 'DIEPGANG', 'LENGTE', 'BREEDTE', 'HOOGTE'],
    },
    fetchZaakFilter: (pbZaakFields) =>
      hasStringInZAAKPRODUCT_ID(
        'Ligplaatsvergunning bedrijfsvaartuig',
        pbZaakFields
      ) ||
      hasStringInZAAK_SUBPRODUCT_ID(
        'Ligplaatsvergunning bedrijfsvaartuig',
        pbZaakFields
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      WB_NAAM_VAARTUIG: 'naamVaartuig',
      WB_DIEPGANG: 'diepgang',
      WB_LENGTE: 'lengte',
      WB_BREEDTE: 'breedte',
      WB_HOOGTE: 'hoogte',
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const OmzettingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Omzettingsvergunning> =
  {
    caseType: caseTypePB.Omzettingsvergunning,
    title: 'Vergunning voor kamerverhuur (omzettingsvergunning)',
    isVerleend: isVTHZaakVerleend,
    fetchZaakFilter: (pbZaakFields) =>
      hasCaseTypeInFMT_CAPTION('Omzetting kamerverhuur', pbZaakFields),
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
    isVerleend: isVTHZaakVerleend,
    fetchZaakFilter: (pbZaakFields) =>
      hasCaseTypeInFMT_CAPTION('Vergunning voor samenvoegen', pbZaakFields),
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
    isVerleend: isVTHZaakVerleend,
    fetchZaakFilter: (pbZaakFields) =>
      hasCaseTypeInFMT_CAPTION(
        OnttrekkingsvergunningZaakTransformer.title,
        pbZaakFields
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
    isVerleend: isVTHZaakVerleend,
    fetchZaakFilter: (pbZaakFields) =>
      // Powerbrowser currently uses a misspelled name, we also check the correct spelling in case this is ever changed
      hasCaseTypeInFMT_CAPTION(
        OnttrekkingsvergunningZaakTransformer.title,
        pbZaakFields
      ) ||
      hasCaseTypeInFMT_CAPTION(
        'Ontrekkingsvergunning voor sloop',
        pbZaakFields
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
    isVerleend: isVTHZaakVerleend,
    fetchZaakFilter: (pbZaakFields) =>
      hasCaseTypeInFMT_CAPTION('Vergunning voor woningvormen', pbZaakFields),
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
    isVerleend: isVTHZaakVerleend,
    fetchZaakFilter: (pbZaakFields) =>
      hasCaseTypeInFMT_CAPTION(
        OnttrekkingsvergunningTweedeWoningZaakTransformer.title,
        pbZaakFields
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
    isVerleend: isVTHZaakVerleend,
    fetchZaakFilter: (pbZaakFields) =>
      hasCaseTypeInFMT_CAPTION(
        SplitsingsvergunningZaakTransformer.title,
        pbZaakFields
      ),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformFieldValues: {
      result: transformVTHZaakResult,
    },
    filterValidDocumentPredicate: isValidVTHDocument,
  };

const pbZaakTransformers_ = [
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
export const pbZaakTransformers = pbZaakTransformers_.map((t) => ({
  ...t,
  fetchZaakFilter: (pbZaakFields: PBZaakFieldsByName) =>
    t.fetchZaakFilter(pbZaakFields) && isValidVTHZaak(pbZaakFields),
})) as typeof pbZaakTransformers_;

export const pbCaseToZaakTransformers = pbZaakTransformers.reduce<
  Record<string, PowerBrowserZaakTransformer>
>((acc, t) => ({ ...acc, [t.caseType]: t }), {});
