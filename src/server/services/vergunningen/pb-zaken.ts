import {
  caseTypePB,
  type Ligplaatsvergunning,
  type Omzettingsvergunning,
} from './config-and-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../powerbrowser/powerbrowser-field-transformers';
import { hasCaseTypeInFMT_CAPTION } from '../powerbrowser/powerbrowser-helpers';
import { PowerBrowserZaakTransformer } from '../powerbrowser/powerbrowser-types';

const LigplaatsvergunningZaakTransformer: PowerBrowserZaakTransformer<Ligplaatsvergunning> =
  {
    caseType: caseTypePB.Ligplaatsvergunning,
    title: 'Ligplaatsvergunning',
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, caseTypePB.Ligplaatsvergunning),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      A: 'requestKind',
      B: 'reason',
      C: 'vesselKind',
      D: 'vesselName',
    },
    transformDoclinks: {
      'Besluiten en vastleggen': ['Besluit Ligplaatsvergunning'],
    } as const,
  };

const OmzettingsvergunningZaakTransformer: PowerBrowserZaakTransformer<Omzettingsvergunning> =
  {
    caseType: caseTypePB.Omzettingsvergunning,
    title: 'Vergunning voor kamerverhuur (omzettingsvergunning)',
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(pbRecordField, caseTypePB.Omzettingsvergunning),
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      X: 'dateInBehandeling',
    },
    transformDoclinks: {
      'Besluiten en vastleggen': ['Besluit Omzettingsvergunning'],
    } as const,
  };

export const pbZaakTransformers = [
  OmzettingsvergunningZaakTransformer,
  LigplaatsvergunningZaakTransformer,
];
