import {
  caseTypePB,
  type Ligplaatsvergunning,
  type Omzettingsvergunning,
  type Onttrekkingsvergunning,
  type OnttrekkingsvergunningSloop,
  type Samenvoegingsvergunning,
  type Splitsingsvergunning,
  type VormenVanWoonruimte,
} from './config-and-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../powerbrowser/powerbrowser-field-transformers';
import { hasCaseTypeInFMT_CAPTION } from '../powerbrowser/powerbrowser-helpers';
import { PowerBrowserZaakTransformer } from '../powerbrowser/powerbrowser-types';

export const documentNamesMA = {
  TOEKENNING: 'Besluit toekenning',
  VERLENGING: 'Besluit verlenging beslistermijn',
  WEIGERING: 'Besluit weigering',
  BUITEN_BEHANDELING: 'Besluit Buiten behandeling',
  INTREKKING: 'Besluit intrekking',
  MEER_INFORMATIE: 'Verzoek aanvullende gegevens',
  SAMENVATTING: 'Samenvatting aanvraagformulier',
} as const;

const LigplaatsvergunningZaakTransformer: PowerBrowserZaakTransformer<Ligplaatsvergunning> =
  {
    caseType: caseTypePB.Ligplaatsvergunning,
    title: 'Ligplaatsvergunning',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
    },
    transformDoclinks: {
      'Besluiten en vastleggen': ['Besluit Ligplaatsvergunning'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
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
      'Besluiten en vastleggen': ['Besluit Omzettingsvergunning'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
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
      'Besluiten en vastleggen': ['Besluit Omzettingsvergunning'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
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
    transformDoclinks: {
      'Besluiten en vastleggen': ['Besluit Omzettingsvergunning'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
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
    transformDoclinks: {
      'Besluiten en vastleggen': ['Besluit Omzettingsvergunning'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
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
    transformDoclinks: {
      'Besluiten en vastleggen': ['Besluit Omzettingsvergunning'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
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
    transformDoclinks: {
      'Besluiten en vastleggen': ['Besluit Omzettingsvergunning'],
      [documentNamesMA.SAMENVATTING]: ['Samenvatting'],
    } as const,
  };

export const pbZaakTransformers = [
  OmzettingsvergunningZaakTransformer,
  LigplaatsvergunningZaakTransformer,
  SplitsingsvergunningZaakTransformer,
  SamenvoegingsvergunningZaakTransformer,
  VormenVanWoonruimteZaakTransformer,
  OnttrekkingsvergunningZaakTransformer,
  OnttrekkingsvergunningSloopZaakTransformer,
];
