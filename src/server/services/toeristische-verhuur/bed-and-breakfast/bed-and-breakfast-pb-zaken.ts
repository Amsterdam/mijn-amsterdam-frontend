import type {
  BedAndBreakfastType} from './bed-and-breakfast-types.ts';
import {
  caseTypeBedAndBreakfast,
  documentNamenMA_PB,
} from './bed-and-breakfast-types.ts';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../../powerbrowser/powerbrowser-field-transformers.ts';
import { hasCaseTypeInFMT_CAPTION } from '../../powerbrowser/powerbrowser-helpers.ts';
import type { PowerBrowserZaakTransformer } from '../../powerbrowser/powerbrowser-types.ts';

export const BedAndBreakfastZaakTransformer: PowerBrowserZaakTransformer<BedAndBreakfastType> =
  {
    caseType: 'Bed en breakfast',
    title: 'Vergunning bed & breakfast',
    fetchZaakIdFilter: (pbRecordField) =>
      hasCaseTypeInFMT_CAPTION(
        pbRecordField,
        caseTypeBedAndBreakfast.BedAndBreakfast
      ),
    transformFields: SELECT_FIELDS_TRANSFORM_BASE,
    transformDoclinks: documentNamenMA_PB,
  };

export const powerBrowserZaakTransformers = [BedAndBreakfastZaakTransformer];
