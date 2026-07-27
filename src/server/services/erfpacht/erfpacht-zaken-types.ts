import type { ErfpachtDossiersDetailSource } from './erfpacht-types.ts';
import type {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';

export type ZaakStatusTypeSource =
  | 'Aanvraag'

  // Meer informatie nodig
  | 'Informatie opgevraagd'
  | 'Informatie aangeleverd'

  // In behandeling
  | 'Aanvraag beoordelen'
  | 'Aanvraag gereed voor behandeling'
  | 'Behandeling'
  | 'Indicatie verstuurd'
  | 'Aanbieding'
  | 'Acceptatie ontvangen'

  // Bij Notaris
  | 'Besluit verstuurd'
  | 'Akte gepasseerd'

  // Afgehandeld
  | 'Aanvraag afgerond'

  // Onbekend
  | 'Onbekend';

export type ZaakInfoSource = {
  zaakNummer: string;
  zaakUuid: string; // TODO: Must be added to the ZaakInfo response. Delegate to Vernise Team.
  zaakOmschrijving: string;
  statusOmschrijving: ZaakStatusTypeSource;
  formattedStatusDatum: string;
  zaakUrl: string;
  zaakDossiers: ErfpachtDossiersDetailSource['dossierId'][];
  titelZaakNummer: string;
  titelZaakOmschrijving: string;
  titelStatusOmschrijving: string;
  titelFormattedStatusDatum: string;
};

export type ZaakInfoResponseSource = {
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  size: number;
  content: ZaakInfoSource[];
  number: number;
  sort: {
    empty: boolean;
    sorted: boolean;
    unsorted: boolean;
  };
  numberOfElements: number;
  pageable: {
    offset: number;
    sort: {
      empty: boolean;
      sorted: boolean;
      unsorted: boolean;
    };
    pageSize: number;
    paged: boolean;
    pageNumber: number;
    unpaged: boolean;
  };
  empty: boolean;
};

export type ZaakStatusSource = {
  datumStatusGezet: string;
  statustoelichting: ZaakStatusTypeSource;
};

export type ZaakStatussenResponseSource = {
  zaakStatussen: ZaakStatusSource[];
  zaakResultaat: string;
};

export type ZaakStatusFrontend =
  | 'Ontvangen'
  | 'Aanvraag'
  | 'Meer informatie nodig'
  | 'In behandeling'
  | 'Aanpassing akte door de notaris'
  | 'Afgehandeld'
  | 'Onbekend'
  | `Onbekend: ${string}`;

//
export type ErfpachtZaakExcerptFrontend = ZaakInfoSource & {
  fetchZaakDetailUrl: string;
  link: LinkProps;
  displayStatus: string;
  dossierLinks: (LinkProps | string)[];
};

// TODO: Welke gegevens zijn nodig?
export type ErfpachtZaakDetailFrontend = Prettify<
  ErfpachtZaakExcerptFrontend &
    ZaakAanvraagDetail & { resultaat: string | null }
>;
