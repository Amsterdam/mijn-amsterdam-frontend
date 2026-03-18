import { type DecosVakantieverhuurVergunningaanvraag } from './toeristische-verhuur.types.ts';
import { caseTypeToeristischeVerhuur } from '../../../client/pages/Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config.ts';
import {
  SELECT_FIELDS_TRANSFORM_BASE,
  location,
  dateStart,
  dateEnd,
} from '../decos/decos-field-transformers.ts';
import type { DecosZaakTransformer } from '../decos/decos-types.ts';

export const VakantieverhuurVergunningaanvraag: DecosZaakTransformer<DecosVakantieverhuurVergunningaanvraag> =
  {
    isActive: true,
    itemType: 'folders',
    caseType: caseTypeToeristischeVerhuur.VakantieverhuurVergunningaanvraag,
    title: 'Vergunning vakantieverhuur',
    transformFields: {
      ...SELECT_FIELDS_TRANSFORM_BASE,
      text6: location,
      date6: dateStart,
      date7: dateEnd,
    },
    async afterTransform(vergunning) {
      /**
       * Vakantieverhuur vergunningen worden na betaling direct verleend en per mail toegekend zonder dat de juiste status in Decos wordt gezet.
       * Later, na controle, wordt mogelijk de vergunning weer ingetrokken.
       */
      vergunning.processed = true;
      vergunning.dateDecision = vergunning.dateDecision
        ? vergunning.dateDecision
        : vergunning.dateRequest;

      if (vergunning.decision?.toLowerCase().includes('ingetrokken')) {
        vergunning.decision = 'Ingetrokken';
      } else {
        vergunning.decision = 'Verleend';
      }

      return vergunning;
    },
  };

export const decosZaakTransformers = [VakantieverhuurVergunningaanvraag];
export const decosZaakTransformersByCaseType = {
  [VakantieverhuurVergunningaanvraag.caseType]:
    VakantieverhuurVergunningaanvraag,
};
