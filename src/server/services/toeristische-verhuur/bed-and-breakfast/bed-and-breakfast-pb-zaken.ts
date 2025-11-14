import {
  BedAndBreakfastType,
  caseTypeBedAndBreakfast,
  documentNamenMA_PB,
} from './bed-and-breakfast-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../../powerbrowser/powerbrowser-field-transformers';
import { hasCaseTypeInFMT_CAPTION } from '../../powerbrowser/powerbrowser-helpers';
import { PowerBrowserZaakTransformer } from '../../powerbrowser/powerbrowser-types';

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
