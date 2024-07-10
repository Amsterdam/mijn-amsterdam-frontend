import type {
  Aandeelhouder,
  Aansprakelijke,
  Bestuurder,
  Gemachtigde,
  KVKData,
  Onderneming,
  OverigeFunctionaris,
  Rechtspersoon,
  Vestiging,
} from '../../../server/services/kvk';
import {
  defaultDateFormat,
  getFullAddress,
  splitCapitals,
} from '../../../universal/helpers';
import { format, ProfileSection } from './formatDataPrivate';
import { Adres } from '../../../universal/types';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import { LinkdInline } from '../../components/Button/Button';

/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type Value = any;
type ProfileLabelValueFormatter =
  | string
  | [
      string | ((key: string, item: any, kvkData?: KVKData) => string),
      (value: any, item: any, kvkData?: KVKData) => Value,
    ];

type ProfileLabels<T> = { [key in keyof T]: ProfileLabelValueFormatter };

type FormattedEigenaar = {
  naam: string | null;
  geboortedatum: string | null;
  bsn?: string;
  adres: string | null;
  woonplaats: string | null;
};

const onderneming: ProfileLabels<Partial<Onderneming>> = {
  handelsnaam: 'Handelsnaam',
  handelsnamen: [
    'Overige handelsnamen',
    (handelsnamen: string[]) =>
      handelsnamen?.length ? (
        <>
          {handelsnamen.map((handelsnaam) => (
            <span key={handelsnaam}>
              {handelsnaam}
              <br />
            </span>
          ))}
        </>
      ) : null,
  ],
  rechtsvorm: 'Rechtsvorm',
  hoofdactiviteit: 'Activiteiten',
  overigeActiviteiten: [
    'Overige activiteiten',
    (activiteiten: string[]) =>
      activiteiten?.length ? (
        <>
          {activiteiten.map((activiteit) => (
            <span key={activiteit}>
              {activiteit}
              <br />
            </span>
          ))}
        </>
      ) : null,
  ],
  datumAanvang: [
    'Startdatum onderneming',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  datumEinde: [
    'Einddatum onderneming',
    (value, item, all) => {
      return value ? defaultDateFormat(value) : null;
    },
  ],
  kvkNummer: 'KVK nummer',
};

const vestiging: ProfileLabels<Partial<Vestiging>> = {
  vestigingsNummer: 'Vestigingsnummer',
  handelsnamen: [
    'Handelsnaam',
    (handelsnamen: string[], { isHoofdvestiging }) =>
      handelsnamen?.length ? (
        <>
          {handelsnamen
            .filter((handelsnaam, index) =>
              isHoofdvestiging ? index === 0 : true
            )
            .map((handelsnaam) => (
              <span key={handelsnaam}>
                {handelsnaam}
                <br />
              </span>
            ))}
        </>
      ) : null,
  ],
  bezoekadres: [
    'Bezoekadres',
    (adres: Adres) =>
      adres
        ? `${getFullAddress(adres)}\n${
            adres.postcode ? adres.postcode + ', ' : ''
          }${adres.woonplaatsNaam}`
        : null,
  ],
  postadres: [
    'Postadres',
    (adres: Adres) =>
      adres
        ? `${getFullAddress(adres)}\n${
            adres.postcode ? adres.postcode + ', ' : ''
          }${adres.woonplaatsNaam}`
        : null,
  ],
  telefoonnummer: [
    'Telefoonnummer',
    (value: string) => (
      <LinkdInline href={`tel:${value}`} external={true}>
        {value}
      </LinkdInline>
    ),
  ],
  websites: [
    'Website',
    (urls: string[]) =>
      urls?.length ? (
        <>
          {urls.map((url) => (
            <span key={url}>
              <LinkdInline key={url} href={url} external={true}>
                {url.replace(/(https?:\/\/)/, '')}
              </LinkdInline>
              <br />
            </span>
          ))}
        </>
      ) : null,
  ],
  emailadres: [
    'E-mail',
    (value: string) =>
      value ? (
        <LinkdInline external={true} href={`mailto:${value}`}>
          {value}
        </LinkdInline>
      ) : null,
  ],
  faxnummer: 'Fax',
  activiteiten: [
    'Activiteiten',
    (activiteiten: string[]) =>
      activiteiten?.length ? (
        <>
          {activiteiten.map((activiteit) => (
            <span key={activiteit}>
              {activiteit}
              <br />
            </span>
          ))}
        </>
      ) : null,
  ],
  datumAanvang: [
    'Datum vestiging',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  datumEinde: [
    'Datum sluiting',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
};

const rechtspersoon: ProfileLabels<
  Partial<Rechtspersoon> & {
    bsn?: string;
  }
> = {
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
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  functie: 'Functie',
  soortBevoegdheid: [
    'Soort bevoegdheid',
    (value) =>
      value
        ? capitalizeFirstLetter(splitCapitals(value).toLocaleLowerCase())
        : '',
  ],
};

const gemachtigde: ProfileLabels<Partial<Gemachtigde>> = {
  naam: 'Naam',
  functie: 'Type gemachtigde',
  datumIngangMachtiging: [
    'Datum ingang machtiging',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
};

const aansprakelijke: ProfileLabels<Partial<Aansprakelijke>> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  functie: 'Functie',
  soortBevoegdheid: [
    'Soort bevoegdheid',
    (value) =>
      value
        ? capitalizeFirstLetter(splitCapitals(value).toLocaleLowerCase())
        : '',
  ],
};

const overigeFunctionaris: ProfileLabels<Partial<OverigeFunctionaris>> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  functie: 'Functie',
};

const eigenaar: ProfileLabels<FormattedEigenaar> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (value ? defaultDateFormat(value) : null),
  ],
  bsn: 'BSN',
  adres: ['Adres', (address) => getFullAddress(address)],
  woonplaats: [
    'Woonplaats',
    (_, all) => `${all.adres.postcode} ${all.adres.woonplaatsNaam}`,
  ],
};

export const kvkInfoLabels = {
  onderneming,
  vestiging,
  rechtspersoon,
  aandeelhouder,
  bestuurder,
  gemachtigde,
  aansprakelijke,
  overigeFunctionaris,
  eigenaar,
};

interface KvkProfileData {
  onderneming: ProfileSection | null;
  eigenaar?: ProfileSection | null;
  rechtspersonen?: ProfileSection[];
  hoofdVestiging?: ProfileSection;
  vestigingen?: ProfileSection[];
  aandeelhouders?: ProfileSection[];
  bestuurders?: ProfileSection[];
  gemachtigden?: ProfileSection[];
  aansprakelijken?: ProfileSection[];
  overigeFunctionarissen?: ProfileSection[];
}

export function formatKvkProfileData(kvkData: KVKData): KvkProfileData {
  const profileData: KvkProfileData = {
    onderneming: format(
      kvkInfoLabels.onderneming,
      kvkData.onderneming,
      kvkData
    ),
    eigenaar: format(kvkInfoLabels.eigenaar, kvkData.eigenaar, kvkData),
  };

  if (kvkData.rechtspersonen?.length) {
    profileData.rechtspersonen = kvkData.rechtspersonen.map((persoon) =>
      format(kvkInfoLabels.rechtspersoon, persoon, kvkData)
    );
  }

  if (kvkData.vestigingen?.length) {
    if (kvkData.vestigingen?.length === 1) {
      profileData.vestigingen = kvkData.vestigingen.map((vestiging) =>
        format(kvkInfoLabels.vestiging, vestiging, kvkData)
      );
    } else {
      const hoofdVestiging = kvkData.vestigingen.find(
        (vestiging) => vestiging.isHoofdvestiging
      );

      profileData.hoofdVestiging = hoofdVestiging
        ? format(kvkInfoLabels.vestiging, hoofdVestiging, kvkData)
        : null;

      profileData.vestigingen = kvkData.vestigingen
        .filter((vestiging) => !vestiging.isHoofdvestiging)
        .map((vestiging) =>
          format(kvkInfoLabels.vestiging, vestiging, kvkData)
        );
    }
  }

  if (kvkData.aandeelhouders?.length) {
    profileData.aandeelhouders = kvkData.aandeelhouders.map((aandeelhouder) =>
      format(kvkInfoLabels.aandeelhouder, aandeelhouder, kvkData)
    );
  }

  if (kvkData.bestuurders?.length) {
    profileData.bestuurders = kvkData.bestuurders.map((bestuurder) =>
      format(kvkInfoLabels.bestuurder, bestuurder, kvkData)
    );
  }

  if (kvkData.gemachtigden?.length) {
    profileData.gemachtigden = kvkData.gemachtigden.map((gemachtigde) =>
      format(kvkInfoLabels.gemachtigde, gemachtigde, kvkData)
    );
  }
  if (kvkData.aansprakelijken?.length) {
    profileData.aansprakelijken = kvkData.aansprakelijken.map(
      (aansprakelijke) =>
        format(kvkInfoLabels.aansprakelijke, aansprakelijke, kvkData)
    );
  }
  if (kvkData.overigeFunctionarissen?.length) {
    profileData.overigeFunctionarissen = kvkData.overigeFunctionarissen.map(
      (overigeFunctionaris) =>
        format(kvkInfoLabels.overigeFunctionaris, overigeFunctionaris, kvkData)
    );
  }
  return profileData;
}
