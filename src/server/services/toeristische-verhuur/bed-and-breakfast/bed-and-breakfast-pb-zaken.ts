import {
  BedAndBreakfastType,
  caseTypeBedAndBreakfast,
  documentNamenMA_PB,
} from './bed-and-breakfast-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../../powerbrowser/powerbrowser-field-transformers';
import { PowerBrowserZaakTransformer } from '../../powerbrowser/powerbrowser-types';

export const BedAndBreakfastZaakTransformer: PowerBrowserZaakTransformer<BedAndBreakfastType> =
  {
    caseType: 'Bed en breakfast',
    title: 'Vergunning bed & breakfast',
    fetchZaakIdFilter: (pbRecordField) =>
      pbRecordField.fieldName === 'FMT_CAPTION' &&
      !!pbRecordField.text &&
      pbRecordField.text?.includes(caseTypeBedAndBreakfast.BedAndBreakfast),
    transformFields: SELECT_FIELDS_TRANSFORM_BASE,
    transformDoclinks: documentNamenMA_PB,
  };

export const powerBrowserZaakTransformers = [BedAndBreakfastZaakTransformer];
