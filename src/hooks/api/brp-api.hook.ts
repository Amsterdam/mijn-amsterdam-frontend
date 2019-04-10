import { useDataApi } from './api.hook';
import { ApiUrls } from 'App.constants';
import { ApiHookState } from './api.types';

// Interfaces shaped to API data state
interface GerelateerdePartner {
  voornamen: string;
  geslachtsnaam: string;
  geboortedatum: string;
  landnaamSluiting: string;
  bsn: number;
}

interface Adres {
  straatnaam: string;
  postcode: string;
  woonplaatsNaam: string;
  huisnummer: string;
  begindatumVerblijf: string;
}

interface EchtgenootPartner {
  datumOntbinding: string;
  plaatsnaamSluitingOmschrijving: string;
  landnaamSluiting: string;
  gerelateerde: GerelateerdePartner;
}

interface Persoon {
  voornamen: string;
  voorvoegselGeslachtsnaam: string;
  geslachtsnaam: string;
  heeftAlsEchtgenootPartner: EchtgenootPartner | EchtgenootPartner[];
  verblijfsadres: Adres;
  omschrijvingBurgerlijkeStaat: MaritalStatusType;
  omschrijvingGeslachtsAanduiding: string;
  tijdvakGeldigheid: { beginGeldigheid: string };
  plaatsnaamSluiting: string;
  landnaamSluiting: string;
  geboortedatum: string;
  geboorteplaatsnaam: string;
  geboortelandnaam: string;
  bsn: number;
}

// Interfaces actually used in app
export type MaritalStatus = {
  dateStarted: string;
  place: string;
  country: string;
  type: MaritalStatusType;
};

export type MaritalStatusType = 'gehuwd' | 'ongehuwd';

export interface Person {
  firstName: string;
  lastName: string;
  fullName: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  countryOfBirth: string;
  bsn: number;
}

export interface Address {
  locality: string;
  dateStarted: string;
}

export interface Addresses {
  current: Address;
}

export interface BrpApiState extends Omit<ApiHookState, 'data'> {
  person?: Person;
  partner?: Pick<Person, 'firstName' | 'lastName' | 'dateOfBirth' | 'bsn'>;
  address?: Addresses;
  maritalStatus?: MaritalStatus;
}

export const useBrpApi = (initialState = {}): BrpApiState => {
  const options = { url: ApiUrls.BRP };
  const api = useDataApi(options, initialState);
  const { data, ...rest } = api;

  // TODO: Cleanup this mess and have the API return properly formatted data.
  if (data.persoon) {
    const persoon: Persoon = data.persoon || {};

    const partnerItem = Array.isArray(persoon.heeftAlsEchtgenootPartner)
      ? persoon.heeftAlsEchtgenootPartner.find(
          item => !('datumOntbinding' in item)
        )
      : persoon.heeftAlsEchtgenootPartner || null;

    const partner = partnerItem &&
      partnerItem.gerelateerde && {
        firstName: partnerItem.gerelateerde.voornamen,
        country: partnerItem.landnaamSluiting,
        lastName: '',
        bsn: 0,
        dateOfBirth: '',
      };

    const address = {
      current: {
        locality: `${persoon.verblijfsadres.straatnaam} ${
          persoon.verblijfsadres.huisnummer
        }
        ${persoon.verblijfsadres.postcode} ${persoon.verblijfsadres
          .woonplaatsNaam || ''}`,
        dateStarted: persoon.verblijfsadres.begindatumVerblijf,
      },
    };

    const maritalStatus = persoon.omschrijvingBurgerlijkeStaat && {
      type: persoon.omschrijvingBurgerlijkeStaat,
      dateStarted: persoon.tijdvakGeldigheid.beginGeldigheid,
      place:
        persoon.plaatsnaamSluiting ||
        (partnerItem && partnerItem.plaatsnaamSluitingOmschrijving) ||
        '',
      country:
        (partner && partner.country) ||
        (partnerItem && partnerItem.landnaamSluiting) ||
        '',
    };

    const lastName = persoon.voorvoegselGeslachtsnaam
      ? `${persoon.voorvoegselGeslachtsnaam} ${persoon.geslachtsnaam}`
      : persoon.geslachtsnaam;

    const person: Person = {
      bsn: persoon.bsn,
      firstName: persoon.voornamen,
      lastName,
      fullName: `${persoon.voornamen} ${lastName}`,
      dateOfBirth: persoon.geboortedatum,
      placeOfBirth: persoon.geboorteplaatsnaam,
      countryOfBirth: persoon.geboortelandnaam,
      gender: persoon.omschrijvingGeslachtsAanduiding,
    };

    return { ...rest, person, partner, address, maritalStatus };
  }

  return rest;
};
