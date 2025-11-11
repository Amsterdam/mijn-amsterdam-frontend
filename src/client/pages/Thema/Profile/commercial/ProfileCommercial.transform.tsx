import { Link } from '@amsterdam/design-system-react';

import type {
  KvkResponseFrontend,
  NatuurlijkPersoon,
  NietNatuurlijkPersoon,
  Vestiging,
} from '../../../../../server/services/hr-kvk/hr-kvk.types';
import type { Onderneming } from '../../../../../server/services/hr-kvk/hr-kvk.types';
import { defaultDateFormat } from '../../../../../universal/helpers/date';
import { AppState } from '../../../../../universal/types/App.types';
import {
  ProfileLabels,
  formatProfileSectionData,
} from '../profileDataFormatter';
import { PanelConfig, ProfileSectionData } from '../ProfileSectionPanel';

/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type KVKPanelKey = keyof Omit<KvkResponseFrontend, 'mokum'> | 'hoofdVestiging';

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
  kvknummer: 'KVK nummer',
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
  bezoekadres: ['Bezoekadres', (adres) => adres],
  postadres: ['Postadres', (adres) => adres],
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
  Partial<NietNatuurlijkPersoon> & {
    bsn?: string;
  },
  AppState['KVK']
> = {
  rsin: 'RSIN',
  kvknummer: 'kvknummer',
  bsn: 'BSN',
  naam: 'Statutaire naam',
  statutaireZetel: 'Statutaire zetel',
};

// TODO: TvO: Check if this is correct
const eigenaar: ProfileLabels<NatuurlijkPersoon, AppState['KVK']> = {
  naam: 'Naam',
  geboortedatum: [
    'Geboortedatum',
    (value) => (typeof value === 'string' ? defaultDateFormat(value) : null),
  ],
  bsn: 'BSN',
  adres: ['Adres', (address) => address],
};

export const labelConfig = {
  onderneming,
  vestiging,
  rechtspersoon,
  eigenaar,
};

interface KvkProfileData {
  onderneming?: ProfileSectionData | null;
  eigenaar?: ProfileSectionData | null;
  hoofdVestiging?: ProfileSectionData;
  vestigingen?: ProfileSectionData[];
}

export function formatKvkProfileData(
  kvkResponse: KvkResponseFrontend
): KvkProfileData {
  const profileData: KvkProfileData = {};

  if (kvkResponse.onderneming) {
    profileData.onderneming = formatProfileSectionData(
      labelConfig.onderneming,
      kvkResponse.onderneming,
      kvkResponse
    );
  }

  if (kvkResponse.eigenaar) {
    profileData.eigenaar = formatProfileSectionData(
      labelConfig.eigenaar,
      kvkResponse.eigenaar,
      kvkResponse
    );
  }

  if (kvkResponse.vestigingen?.length) {
    if (kvkResponse.vestigingen?.length === 1) {
      profileData.vestigingen = kvkResponse.vestigingen.map((vestiging) =>
        formatProfileSectionData(labelConfig.vestiging, vestiging, kvkResponse)
      );
    } else {
      const hoofdVestiging = kvkResponse.vestigingen.find(
        (vestiging) => vestiging.isHoofdvestiging
      );

      profileData.hoofdVestiging = hoofdVestiging
        ? formatProfileSectionData(
            labelConfig.vestiging,
            hoofdVestiging,
            kvkResponse
          )
        : undefined;

      profileData.vestigingen = kvkResponse.vestigingen
        .filter((vestiging) => !vestiging.isHoofdvestiging)
        .map((vestiging) =>
          formatProfileSectionData(
            labelConfig.vestiging,
            vestiging,
            kvkResponse
          )
        );
    }
  }

  return profileData;
}

export const panelConfig: PanelConfig<KVKPanelKey, AppState['KVK']> = {
  onderneming: () => ({
    title: 'Onderneming',
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
  eigenaar: () => ({
    title: 'Eigenaar',
    actionLinks: [],
  }),
};
