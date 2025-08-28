import {
  BedAndBreakfastType,
  caseTypeBedAndBreakfast,
} from './bed-and-breakfast-types';
import { SELECT_FIELDS_TRANSFORM_BASE } from '../../powerbrowser/powerbrowser-field-transformers';
import { PowerBrowserZaakTransformer } from '../../powerbrowser/powerbrowser-types';

export const bbDocumentNamesMA = {
  TOEKENNING: 'Besluit toekenning',
  VERLENGING: 'Besluit verlenging beslistermijn',
  WEIGERING: 'Besluit weigering',
  BUITEN_BEHANDELING: 'Besluit Buiten behandeling',
  INTREKKING: 'Besluit intrekking',
  MEER_INFORMATIE: 'Verzoek aanvullende gegevens',
  SAMENVATTING: 'Samenvatting aanvraagformulier',
} as const;

export const BedAndBreakfastZaakTransformer: PowerBrowserZaakTransformer<BedAndBreakfastType> =
  {
    caseType: 'Bed en breakfast',
    title: 'Vergunning bed & breakfast',
    fetchZaakIdFilter: (pbRecordField) =>
      pbRecordField.fieldName === 'FMT_CAPTION' &&
      !!pbRecordField.text &&
      pbRecordField.text?.includes(caseTypeBedAndBreakfast.BedAndBreakfast),
    transformFields: SELECT_FIELDS_TRANSFORM_BASE,
    transformDoclinks: {
      [bbDocumentNamesMA.TOEKENNING]: [
        'BB Besluit vergunning bed and breakfast',
        'BB Besluit van rechtswege',
      ],
      [bbDocumentNamesMA.VERLENGING]: ['BB Besluit verlenging beslistermijn'],
      [bbDocumentNamesMA.BUITEN_BEHANDELING]: [
        'BB Besluit buiten behandeling stellen',
        'BB buiten behandeling stellen',
      ],
      [bbDocumentNamesMA.WEIGERING]: [
        'Besluit weigering',
        'BB Besluit weigeren vergunning',
        'BB Besluit weigeren vergunning quotum',
        'Besluit B&B weigering zonder overgangsrecht',
      ],
      [bbDocumentNamesMA.INTREKKING]: [
        'Intrekken vergunning',
        'BB Intrekkingsbesluit nav niet voldoen aan voorwaarden',
        'BB Intrekkingsbesluit op eigen verzoek',
      ],
      [bbDocumentNamesMA.MEER_INFORMATIE]: ['BB Verzoek aanvullende gegevens'],
      [bbDocumentNamesMA.SAMENVATTING]: ['Samenvatting'],
    },
  };

export const powerBrowserZaakTransformers = [BedAndBreakfastZaakTransformer];
