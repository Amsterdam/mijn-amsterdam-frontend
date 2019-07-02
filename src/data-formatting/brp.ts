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

interface BrpResponseData {
  persoon: Persoon;
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
  bsn: number;
}

export interface Address {
  locality: string;
  dateStarted: string;
}

export interface Addresses {
  current: Address;
}

export interface BrpDataFormatted {
  person?: Person;
  partner?: Pick<Person, 'firstName' | 'lastName' | 'dateOfBirth' | 'bsn'> &
    MaritalStatus;
  address?: Addresses;
}

export default function formatBrpApiResponse(
  responseData: BrpResponseData
): BrpDataFormatted {
  // TODO: Cleanup this mess and have the API return properly formatted data.
  if (responseData.persoon) {
    const persoon: Persoon = responseData.persoon || {};

    const partnerItem = Array.isArray(persoon.heeftAlsEchtgenootPartner)
      ? persoon.heeftAlsEchtgenootPartner.find(
          item => !('datumOntbinding' in item)
        )
      : persoon.heeftAlsEchtgenootPartner || null;

    const maritalStatus = persoon.omschrijvingBurgerlijkeStaat && {
      type: persoon.omschrijvingBurgerlijkeStaat,
      dateStarted:
        persoon.tijdvakGeldigheid && persoon.tijdvakGeldigheid.beginGeldigheid,
      place:
        persoon.plaatsnaamSluiting ||
        (partnerItem && partnerItem.plaatsnaamSluitingOmschrijving) ||
        '',
      country: (partnerItem && partnerItem.landnaamSluiting) || '',
    };

    const partner = partnerItem &&
      partnerItem.gerelateerde && {
        firstName: partnerItem.gerelateerde.voornamen,
        country: partnerItem.landnaamSluiting,
        lastName: partnerItem.gerelateerde.geslachtsnaam,
        bsn: 0,
        dateOfBirth: partnerItem.gerelateerde.geboortedatum,
        ...(maritalStatus || {}),
      };

    const address = persoon.verblijfsadres && {
      current: {
        locality: `${persoon.verblijfsadres.straatnaam} ${
          persoon.verblijfsadres.huisnummer
        }
        ${persoon.verblijfsadres.postcode
          .split(/([0-9]{4})/g)
          .join(' ')} ${persoon.verblijfsadres.woonplaatsNaam || ''}`,
        dateStarted: persoon.verblijfsadres.begindatumVerblijf,
      },
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
      placeOfBirth: `${persoon.geboorteplaatsnaam}, ${
        persoon.geboortelandnaam
      }`,
      gender: persoon.omschrijvingGeslachtsAanduiding,
    };

    return { person, partner, address };
  }

  return {};
}
