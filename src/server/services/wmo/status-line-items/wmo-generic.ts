import {
  ZorgnedAanvraagTransformed,
  ZorgnedStatusLineItemTransformerConfig,
} from '../../zorgned/zorgned-config-and-types';
import {
  DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH,
  DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE,
} from '../wmo-config-and-types';

export function hasMeerInformatieNodig(aanvraag: ZorgnedAanvraagTransformed) {
  return aanvraag.documenten.some((document) =>
    document.title.startsWith(DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH)
  );
}

export const AANVRAAG: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Aanvraag ontvangen',
  datePublished: '',
  isChecked: () => true,
  isActive: () => false,
  description: () => {
    return '<p>Wij hebben uw aanvraag ontvangen</p>';
  },
};

export const IN_BEHANDELING: ZorgnedStatusLineItemTransformerConfig = {
  status: 'In behandeling',
  datePublished: (aanvraag) => aanvraag.datumBesluit,
  isChecked: () => true,
  isActive: (stepIndex, aanvraag) =>
    !aanvraag.datumBesluit && !hasMeerInformatieNodig(aanvraag),
  description: () => {
    return '<p>Uw aanvraag is in behandeling genomen</p>';
  },
};

export const MEER_INFORMATIE: ZorgnedStatusLineItemTransformerConfig = {
  status: 'Meer informatie nodig',
  isVisible: (stepIndex, aanvraag) => hasMeerInformatieNodig(aanvraag),
  datePublished: (aanvraag) => {
    return (
      aanvraag.documenten.find((document) =>
        document.title.startsWith(DOCUMENT_TITLE_MEER_INFORMATIE_STARTS_WITH)
      )?.datePublished ?? ''
    );
  },
  isChecked: (stepIndex, aanvraag) => hasMeerInformatieNodig(aanvraag),
  isActive: (stepIndex, aanvraag) =>
    !aanvraag.datumBesluit && hasMeerInformatieNodig(aanvraag),
  description: () => {
    return `<p>
      Om uw aanvraag te kunnen beoordelen hebben wij meer informatie nodig.
      U kunt de informatie aanleveren via dit <a rel="noreferrer" class="ams-link ams-link--inline" href="${DOCUMENT_UPLOAD_LINK_MEER_INFORMATIE}">formulier</a>.
    </p>`;
  },
};
