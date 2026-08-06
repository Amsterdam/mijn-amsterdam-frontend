import type { ErfpachtDossiersDetailSource } from './erfpacht-types.ts';
import type { ZaakStatusTypeSource } from './erfpacht-zaken-config.ts';
import type { SomeOtherString } from '../../../universal/helpers/types.ts';
import type {
  LinkProps,
  ZaakAanvraagDetail,
} from '../../../universal/types/App.types.ts';

export type ZaakInfoSource = {
  zaakNummer: string;
  zaakUuid: string;
  zaakOmschrijving: string;
  statusOmschrijving: ZaakStatusTypeSource;
  formattedStatusDatum: string;
  zaakUrl: string;
  zaakDossiers?: ErfpachtDossiersDetailSource['dossierNummer'][];
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

export type ZaakResultaatSource =
  | 'Aangegaan'
  | 'Niet doorgegaan'
  | SomeOtherString;

export type ZaakResultaatFrontend =
  | 'Overeenkomst/indicatie'
  | 'Niet doorgegaan'
  | SomeOtherString;

export type ZaakStatussenResponseSource = {
  zaakStatussen: ZaakStatusSource[];
  zaakResultaat: ZaakResultaatSource;
};

export type ZaakStatusFrontend =
  | 'Aanvraag'
  | 'Meer informatie nodig'
  | 'In behandeling'
  | 'Afgehandeld'
  | SomeOtherString;

//
export type ErfpachtZaakExcerptFrontend = Prettify<
  ZaakInfoSource & {
    datePublished: string | null;
    datePublishedFormatted: string | null;
    fetchZaakDetailUrl: string;
    link: LinkProps;
    displayStatus: string;
    dossierLinks: (LinkProps | string)[];
  }
>;

export type ErfpachtZaakDetailFrontend = Prettify<
  ErfpachtZaakExcerptFrontend &
    ZaakAanvraagDetail & {
      resultaat: ZaakResultaatFrontend | SomeOtherString | null;
    }
>;
