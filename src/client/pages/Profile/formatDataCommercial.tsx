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
  overigeHandelsnamen: [
    'Overige handelsnamen',
    (handelsnamen: string[]) =>
      handelsnamen ? (
        <>
          {handelsnamen.map(handelsnaam => (
            <>
              {handelsnaam}
              <br />
            </>
          ))}
        </>
      ) : null,
  ],
  rechtsvorm: 'Rechtsvorm',
  hoofdactiviteit: 'Activiteiten',
  overigeActiviteiten: [
    'Overige activiteiten',
    (activiteiten: string[]) =>
      activiteiten ? (
        <>
          {activiteiten.map(activiteit => (
            <>
              {activiteit}
              <br />
            </>
          ))}
        </>
      ) : null,
  ],
  datumAanvang: [
    'Startdatum onderneming',
    value => (value ? defaultDateFormat(value) : null),
  ],
  datumEinde: [
    'Startdatum onderneming',
    value => (value ? defaultDateFormat(value) : null),
  ],
};

const vestiging: ProfileLabels<Partial<Vestiging>> = {
  vestigingsNummer: 'Vestigingsnummer',
  handelsnamen: [
    'Handelsnaam',
    (handelsnamen: string[]) =>
      handelsnamen ? (
        <>
          {handelsnamen.map(handelsnaam => (
            <>
              {handelsnaam}
              <br />
            </>
          ))}
        </>
      ) : null,
  ],
  isHoofdvestiging: ['Hoofdvestiging', value => (value ? 'Ja' : null)],

  bezoekadres: [
    'Bezoekadres',
    (value: Adres) => (value ? getFullAddress(value) : null),
  ],
  postadres: [
    'Postadres',
    (value: Adres) => (value ? getFullAddress(value) : null),
  ],
  telefoonnummer: [
    'Telefoonnummer',
    (value: string) => <LinkdInline href={`tel:${value}`}>{value}</LinkdInline>,
  ],

  website: [
    'Internetadres',
    (url: string) =>
      url ? (
        <LinkdInline key={url} href={url} external={true}>
          {url}
        </LinkdInline>
      ) : null,
  ],
  email: [
    'E-mail',
    (value: string) =>
      value ? (
        <LinkdInline external={true} href={`mailto:${value}`}>
          {value}
        </LinkdInline>
      ) : null,
  ],
  fax: 'Fax',
  activiteiten: [
    'Activiteiten',
    (activiteiten: string[]) =>
      activiteiten ? (
        <>
          {activiteiten.map(activiteit => (
            <>
              {activiteit}
              <br />
            </>
          ))}
        </>
      ) : null,
  ],
  datumAanvang: [
    'Datum vestiging',
    value => (value ? defaultDateFormat(value) : null),
  ],
  datumEinde: [
    'Datum sluiting',
    value => (value ? defaultDateFormat(value) : null),
  ],
};

const rechtspersoon: ProfileLabels<Partial<Rechtspersoon> & {
  bsn?: string;
}> = {
  rsin: 'RSIN',
  kvkNummer: 'KVKnummer',
  bsn: 'BSN',
  statutaireNaam: 'Statutaire naam',
  statutaireZetel: 'Statutaire zetel',
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
