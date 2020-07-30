import React from 'react';
import {
  Aandeelhouder,
  Adres,
  Bestuurder,
  KVKData,
  Onderneming,
  Rechtspersoon,
  Vestiging,
} from '../../../server/services/kvk';
import { defaultDateFormat, getFullAddress } from '../../../universal/helpers';
import { LinkdInline } from '../../components/index';
import { format, ProfileSection } from './formatData';

/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type Value = any;
type ProfileLabelValueFormatter =
  | string
  | [
      string | ((key: string, item: any, kvkData?: KVKData) => string),
      (value: any, item: any, kvkData?: KVKData) => Value
    ];

type ProfileLabels<T> = { [key in keyof T]: ProfileLabelValueFormatter };

const onderneming: ProfileLabels<Partial<Onderneming>> = {
  handelsnaam: 'Handelsnaam',
  // overigeHandelsnamen: value =>
  //     Array.isArray(value)
  //       ? value.map(({ omschrijving }) => omschrijving).join(' ')
  //       : null,
  rechtsvorm: 'Rechtsvorm',
  hoofdactiviteit: 'Activiteiten',
  // overigeActiviteiten: string[];
  datumAanvang: ['Startdatum onderneming', value => defaultDateFormat(value)],
  datumEinde: ['Startdatum onderneming', value => defaultDateFormat(value)],
  aantalWerkzamePersonen: 'Aantal werkzame personen',
};

const vestiging: ProfileLabels<Partial<Vestiging>> = {
  vestigingsnummer: 'Vestigingsnummer',
  handelsnaam: 'Handelsnaam',
  // isHoofdvestiging: ['Is hoofdvestiging', value => value ? 'Ja' : 'Nee'],

  bezoekadres: ['Bezoekadres', (value: Adres) => getFullAddress(value)],
  postadres: ['Postadres', (value: Adres) => getFullAddress(value)],
  telefoonnummer: [
    'Telefoonnummer',
    (value: string) => <LinkdInline href={`tel:${value}`}>{value}</LinkdInline>,
  ],

  websites: [
    'Internetadres',
    (value: string[]) => (
      <>
        {value.map(url => (
          <LinkdInline key={url} href={url} external={true}>
            {url}
          </LinkdInline>
        ))}
      </>
    ),
  ],
  email: [
    'E-mail',
    (value: string) => (
      <LinkdInline external={true} href={`mailto:${value}`}>
        {value}
      </LinkdInline>
    ),
  ],
  fax: 'Fax',
  activiteiten: 'Activiteiten',
  datumAanvang: ['Datum vestiging', value => defaultDateFormat(value)],
  // datumEinde: string | nullstring,
  aantalWerkzamePersonen: 'Werkzame personen',
};

const rechtspersoon: ProfileLabels<Partial<Rechtspersoon> & {
  bsn?: string;
}> = {
  rsin: 'RSIN',
  kvkNummer: 'KVKnummer',
  bsn: 'BSN',
  statutaireNaam: 'Statutaire naam',
  statutaireVestigingsplaats: 'Vestiging',
};

const aandeelhouder: ProfileLabels<Partial<Aandeelhouder>> = {
  opgemaakteNaam: 'Naam',
  geboortedatum: 'Geboortedatum',
  bevoegdheid: 'Bevoegdheid',
};

const bestuurder: ProfileLabels<Partial<Bestuurder>> = {
  opgemaakteNaam: 'Naam',
  geboortedatum: 'Geboortedatum',
  functietitel: 'Functietitel',
  bevoegdheid: 'Bevoegdheid',
};

export const kvkInfoLabels = {
  onderneming,
  vestiging,
  rechtspersoon,
  aandeelhouder,
  bestuurder,
};

interface KvkProfileData {
  onderneming: ProfileSection;
  rechtspersonen?: ProfileSection[];
  vestigingen?: ProfileSection[];
  aandeelhouders?: ProfileSection[];
  bestuurders?: ProfileSection[];
}

export function formatKvkProfileData(kvkData: KVKData): KvkProfileData {
  const profileData: KvkProfileData = {
    onderneming: format(
      kvkInfoLabels.onderneming,
      kvkData.onderneming,
      kvkData
    ),
  };

  if (kvkData.rechtspersonen?.length) {
    profileData.rechtspersonen = kvkData.rechtspersonen.map(persoon =>
      format(kvkInfoLabels.rechtspersoon, persoon, kvkData)
    );
  }

  if (kvkData.vestigingen?.length) {
    profileData.vestigingen = kvkData.vestigingen.map(vestiging =>
      format(kvkInfoLabels.vestiging, vestiging, kvkData)
    );
  }

  if (kvkData.aandeelhouders?.length) {
    profileData.aandeelhouders = kvkData.aandeelhouders.map(aandeelhouder =>
      format(kvkInfoLabels.aandeelhouder, aandeelhouder, kvkData)
    );
  }

  if (kvkData.bestuurders?.length) {
    profileData.bestuurders = kvkData.bestuurders.map(bestuurder =>
      format(kvkInfoLabels.bestuurder, bestuurder, kvkData)
    );
  }
  return profileData;
}
