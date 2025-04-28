import { Link } from '@amsterdam/design-system-react';

import type {
  Aandeelhouder,
  Aansprakelijke,
  Bestuurder,
  Eigenaar,
  Gemachtigde,
  KVKData,
  Onderneming,
  OverigeFunctionaris,
  Rechtspersoon,
  Vestiging,
} from '../../../../../server/services/kvk';
import { getFullAddress } from '../../../../../universal/helpers/brp';
import { defaultDateFormat } from '../../../../../universal/helpers/date';
import {
  capitalizeFirstLetter,
  splitCapitals,
} from '../../../../../universal/helpers/text';
import { Adres, AppState } from '../../../../../universal/types';
import {
  ProfileLabels,
  formatProfileSectionData,
} from '../profileDataFormatter';
import { PanelConfig, ProfileSectionData } from '../ProfileSectionPanel';

/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type KVKPanelKey = keyof Omit<KVKData, 'mokum'> | 'hoofdVestiging';

const onderneming: ProfileLabels<Partial<Onderneming>, AppState['KVK']> = {
  handelsnaam: 'Handelsnaam',
  handelsnamen: [
    'Overige handelsnamen',
    (handelsnamen) =>
      handelsnamen?.length
        ? handelsnamen.map((handelsnaam) => (
            <span key={handelsnaam}>
              {handelsnaam}
              <br />
            </span>
          ))
        : null,
  ],
  rechtsvorm: 'Rechtsvorm',
  hoofdactiviteit: 'Activiteiten',
  overigeActiviteiten: [
    'Overige activiteiten',
    (activiteiten) =>
      activiteiten?.length
        ? activiteiten.map((activiteit) => (
            <span key={activiteit}>
              {activiteit}
              <br />
            </span>
          ))
        : null,
  ],
  datumAanvang: [
    'Startdatum onderneming',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  datumEinde: [
    'Einddatum onderneming',
    (value, item, all) => {
      return value ? defaultDateFormat(value) : null;
    },
  ],
  kvkNummer: 'KVK nummer',
};

const vestiging: ProfileLabels<Partial<Vestiging>, AppState['KVK']> = {
  vestigingsNummer: 'Vestigingsnummer',
  handelsnamen: [
    'Handelsnaam',
    (handelsnamen, { isHoofdvestiging }) =>
      handelsnamen?.length
        ? handelsnamen
            .filter((handelsnaam, index) =>
              isHoofdvestiging ? index === 0 : true
            )
            .map((handelsnaam) => (
              <span key={handelsnaam}>
                {handelsnaam}
                <br />
              </span>
            ))
        : null,
  ],
  bezoekadres: [
    'Bezoekadres',
    (adres) =>
      adres
        ? `${getFullAddress(adres)}\n${
            adres.postcode ? adres.postcode + ', ' : ''
          }${adres.woonplaatsNaam}`
        : null,
  ],
  postadres: [
    'Postadres',
    (adres) =>
      adres
        ? `${getFullAddress(adres)}\n${
            adres.postcode ? adres.postcode + ', ' : ''
          }${adres.woonplaatsNaam}`
        : null,
  ],
  telefoonnummer: [
    'Telefoonnummer',
    (value) => (
      <Link href={`tel:${value}`} rel="noopener noreferrer">
        {value}
      </Link>
    ),
  ],
  websites: [
    'Website',
    (urls) =>
      urls?.length ? (
        <>
          {urls.map((url) => (
            <span key={url}>
              <Link key={url} href={url} rel="noopener noreferrer">
                {url.replace(/(https?:\/\/)/, '')}
              </Link>
              <br />
            </span>
          ))}
        </>
      ) : null,
  ],
  emailadres: [
    'E-mail',
    (value) =>
      value ? (
        <Link rel="noopener noreferrer" href={`mailto:${value}`}>
          {value}
        </Link>
      ) : null,
  ],
  faxnummer: 'Fax',
  activiteiten: [
    'Activiteiten',
    (activiteiten) =>
      activiteiten?.length
        ? activiteiten.map((activiteit) => (
            <span key={activiteit}>
              {activiteit}
              <br />
            </span>
          ))
        : null,
  ],
  datumAanvang: [
    'Datum vestiging',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  datumEinde: [
    'Datum sluiting',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
};

const rechtspersoon: ProfileLabels<
  Partial<Rechtspersoon> & {
    bsn?: string;
  },
  AppState['KVK']
> = {
  rsin: 'RSIN',
  kvkNummer: 'KVKnummer',
  bsn: 'BSN',
  statutaireNaam: 'Statutaire naam',
  statutaireZetel: 'Statutaire zetel',
};

const aandeelhouder: ProfileLabels<Partial<Aandeelhouder>, AppState['KVK']> = {
  opgemaakteNaam: 'Naam',
  geboortedatum: 'Geboortedatum',
  bevoegdheid: 'Bevoegdheid',
};

const bestuurder: ProfileLabels<Partial<Bestuurder>, AppState['KVK']> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  functie: 'Functie',
  soortBevoegdheid: [
    'Soort bevoegdheid',
    (value) =>
      typeof value === 'string'
        ? capitalizeFirstLetter(splitCapitals(value).toLocaleLowerCase())
        : '',
  ],
};

const gemachtigde: ProfileLabels<Partial<Gemachtigde>, AppState['KVK']> = {
  naam: 'Naam',
  functie: 'Type gemachtigde',
  datumIngangMachtiging: [
    'Datum ingang machtiging',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
};

const aansprakelijke: ProfileLabels<
  Partial<Aansprakelijke>,
  AppState['KVK']
> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  functie: 'Functie',
  soortBevoegdheid: [
    'Soort bevoegdheid',
    (value) =>
      typeof value === 'string'
        ? capitalizeFirstLetter(splitCapitals(value).toLocaleLowerCase())
        : '',
  ],
};

const overigeFunctionaris: ProfileLabels<
  Partial<OverigeFunctionaris>,
  AppState['KVK']
> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  functie: 'Functie',
};

// TODO: TvO: Check if this is correct
const eigenaar: ProfileLabels<Eigenaar, AppState['KVK']> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  bsn: 'BSN',
  adres: [
    'Adres',
    (address) =>
      address && typeof address !== 'string' && typeof address !== 'number'
        ? getFullAddress(address as Adres)
        : null,
  ],
  ['woonplaats' as any]: [
    'Woonplaats',
    (_, eigenaar) =>
      `${eigenaar.adres?.postcode} ${eigenaar.adres.woonplaatsNaam}`,
  ],
};

export const labelConfig = {
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
  onderneming?: ProfileSectionData | null;
  eigenaar?: ProfileSectionData | null;
  rechtspersonen?: ProfileSectionData[];
  hoofdVestiging?: ProfileSectionData;
  vestigingen?: ProfileSectionData[];
  aandeelhouders?: ProfileSectionData[];
  bestuurders?: ProfileSectionData[];
  gemachtigden?: ProfileSectionData[];
  aansprakelijken?: ProfileSectionData[];
  overigeFunctionarissen?: ProfileSectionData[];
}

export function formatKvkProfileData(kvkData: KVKData): KvkProfileData {
  const profileData: KvkProfileData = {};

  if (kvkData.onderneming) {
    profileData.onderneming = formatProfileSectionData(
      labelConfig.onderneming,
      kvkData.onderneming,
      kvkData
    );
  }

  if (kvkData.eigenaar) {
    profileData.eigenaar = formatProfileSectionData(
      labelConfig.eigenaar,
      kvkData.eigenaar,
      kvkData
    );
  }

  if (kvkData.rechtspersonen?.length) {
    profileData.rechtspersonen = kvkData.rechtspersonen.map((persoon) =>
      formatProfileSectionData(labelConfig.rechtspersoon, persoon, kvkData)
    );
  }

  if (kvkData.vestigingen?.length) {
    if (kvkData.vestigingen?.length === 1) {
      profileData.vestigingen = kvkData.vestigingen.map((vestiging) =>
        formatProfileSectionData(labelConfig.vestiging, vestiging, kvkData)
      );
    } else {
      const hoofdVestiging = kvkData.vestigingen.find(
        (vestiging) => vestiging.isHoofdvestiging
      );

      profileData.hoofdVestiging = hoofdVestiging
        ? formatProfileSectionData(
            labelConfig.vestiging,
            hoofdVestiging,
            kvkData
          )
        : undefined;

      profileData.vestigingen = kvkData.vestigingen
        .filter((vestiging) => !vestiging.isHoofdvestiging)
        .map((vestiging) =>
          formatProfileSectionData(labelConfig.vestiging, vestiging, kvkData)
        );
    }
  }

  if (kvkData.aandeelhouders?.length) {
    profileData.aandeelhouders = kvkData.aandeelhouders.map((aandeelhouder) =>
      formatProfileSectionData(
        labelConfig.aandeelhouder,
        aandeelhouder,
        kvkData
      )
    );
  }

  if (kvkData.bestuurders?.length) {
    profileData.bestuurders = kvkData.bestuurders.map((bestuurder) =>
      formatProfileSectionData(labelConfig.bestuurder, bestuurder, kvkData)
    );
  }

  if (kvkData.gemachtigden?.length) {
    profileData.gemachtigden = kvkData.gemachtigden.map((gemachtigde) =>
      formatProfileSectionData(labelConfig.gemachtigde, gemachtigde, kvkData)
    );
  }
  if (kvkData.aansprakelijken?.length) {
    profileData.aansprakelijken = kvkData.aansprakelijken.map(
      (aansprakelijke) =>
        formatProfileSectionData(
          labelConfig.aansprakelijke,
          aansprakelijke,
          kvkData
        )
    );
  }
  if (kvkData.overigeFunctionarissen?.length) {
    profileData.overigeFunctionarissen = kvkData.overigeFunctionarissen.map(
      (overigeFunctionaris) =>
        formatProfileSectionData(
          labelConfig.overigeFunctionaris,
          overigeFunctionaris,
          kvkData
        )
    );
  }
  return profileData;
}

export const panelConfig: PanelConfig<KVKPanelKey, AppState['KVK']> = {
  onderneming: () => ({
    title: 'Onderneming',
    actionLinks: [],
  }),
  rechtspersonen: (KVK) => ({
    title:
      KVK.content?.rechtspersonen.length &&
      KVK.content.rechtspersonen.length > 1
        ? 'Rechtspersonen'
        : 'Rechtspersoon',
    actionLinks: [],
  }),
  hoofdVestiging: () => ({
    title: 'Hoofdvestiging',
    actionLinks: [],
  }),
  vestigingen: (KVK) => ({
    title: KVK.content?.vestigingen?.length !== 1 ? 'Vestigingen' : 'Vestiging',
    actionLinks: [],
  }),
  aandeelhouders: (KVK) => ({
    title:
      KVK.content?.aandeelhouders.length &&
      KVK.content.aandeelhouders.length > 1
        ? 'Aandeelhouders'
        : 'Aandeelhouder',
    actionLinks: [],
  }),
  bestuurders: (KVK) => ({
    title:
      KVK.content?.bestuurders.length && KVK.content.bestuurders.length > 1
        ? 'Bestuurders'
        : 'Bestuurder',
    actionLinks: [],
  }),
  overigeFunctionarissen: (KVK) => ({
    title:
      KVK.content?.overigeFunctionarissen.length &&
      KVK.content.overigeFunctionarissen.length > 1
        ? 'Overige functionarissen'
        : 'Overige functionaris',
    actionLinks: [],
  }),
  gemachtigden: () => ({
    title: 'Gemachtigde',
    actionLinks: [],
  }),
  aansprakelijken: () => ({
    title: 'Aansprakelijke',
    actionLinks: [],
  }),
  eigenaar: () => ({
    title: 'Eigenaar',
    actionLinks: [],
  }),
};
