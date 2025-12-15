import { Link } from '@amsterdam/design-system-react';

import type {
  KvkResponseFrontend,
  NatuurlijkPersoon,
  NietNatuurlijkPersoon,
  Vestiging,
} from '../../../../../server/services/hr-kvk/hr-kvk.types';
import type { Onderneming } from '../../../../../server/services/hr-kvk/hr-kvk.types';
import { AppState } from '../../../../../universal/types/App.types';
import { ListExpandable } from '../../../../components/ListExpandable/ListExpandable';
import { PreWrap } from '../../../../components/PreWrap/PreWrap';
import {
  ProfileLabels,
  formatProfileSectionData,
} from '../profileDataFormatter';
import { PanelConfig, ProfileSectionData } from '../ProfileSectionPanel';

/**
 * The functionality in this file transforms the data from the api into a structure which is fit for loading
 * into the Profile page data.
 */

type KVKPanelKey =
  | keyof Omit<KvkResponseFrontend, 'mokum' | 'kvkTranslation'>
  | 'hoofdVestiging';

const onderneming: ProfileLabels<Partial<Onderneming>, AppState['KVK']> = {
  kvknummer: 'KVK nummer',
  handelsnaam: 'Handelsnaam',
  datumAanvangFormatted: 'Startdatum onderneming',
  datumEindeFormatted: 'Einddatum onderneming',
  handelsnamen: [
    'Overige handelsnamen',
    (handelsnamen) =>
      handelsnamen?.length && handelsnamen.length > 1 ? (
        <ListExpandable
          className="ams-mb-l"
          expandButtonText="Toon alle handelsnamen"
          items={handelsnamen}
        />
      ) : (
        handelsnamen?.[0]
      ),
  ],
  hoofdactiviteit: 'Activiteiten',
  overigeActiviteiten: [
    'Overige activiteiten',
    (activiteiten) =>
      activiteiten && activiteiten.length > 1 ? (
        <ListExpandable
          className="ams-mb-l"
          expandButtonText="Toon alle activiteiten"
          items={activiteiten}
        />
      ) : (
        activiteiten?.[0]
      ),
  ],
};

const vestiging: ProfileLabels<Partial<Vestiging>, AppState['KVK']> = {
  naam: ['Naam vestiging', (name) => (name ? <strong>{name}</strong> : null)],
  vestigingsNummer: 'Vestigingsnummer',
  datumAanvangFormatted: 'Datum vestiging',
  datumEindeFormatted: 'Datum sluiting',
  handelsnamen: [
    'Overige namen',
    (handelsnamen) =>
      handelsnamen && handelsnamen.length > 1 ? (
        <ListExpandable
          className="ams-mb-l"
          expandButtonText="Toon alle namen"
          items={handelsnamen}
        />
      ) : (
        handelsnamen?.[0]
      ),
  ],
  bezoekadres: [
    'Bezoekadres',
    (adres) => (adres ? <PreWrap>{adres}</PreWrap> : null),
  ],
  postadres: [
    'Postadres',
    (adres) => (adres ? <PreWrap>{adres}</PreWrap> : null),
  ],
  telefoonnummer: [
    'Telefoonnummer',
    (phonenumbers) =>
      phonenumbers && phonenumbers.length > 1 ? (
        <ListExpandable
          className="ams-mb-l"
          expandButtonText="Toon alle websites"
          items={phonenumbers}
          renderItem={(number) => (
            <Link href={`tel:${number}`} rel="noopener noreferrer">
              {number}
            </Link>
          )}
        />
      ) : phonenumbers?.length ? (
        <Link href={`tel:${phonenumbers[0]}`} rel="noopener noreferrer">
          {phonenumbers[0]}
        </Link>
      ) : null,
  ],
  websites: [
    'Website',
    (urls) =>
      urls && urls.length > 1 ? (
        <ListExpandable
          className="ams-mb-l"
          expandButtonText="Toon alle websites"
          items={urls}
          renderItem={(url) => (
            <Link
              key={url}
              href={url.startsWith('http') ? url : `https://${url}`}
              rel="noopener noreferrer"
            >
              {url.replace(/(https?:\/\/)/, '')}
            </Link>
          )}
        />
      ) : urls?.length ? (
        <Link
          key={urls[0]}
          href={urls[0].startsWith('http') ? urls[0] : `https://${urls[0]}`}
          rel="noopener noreferrer"
        >
          {urls[0].replace(/(https?:\/\/)/, '')}
        </Link>
      ) : null,
  ],
  emailadres: [
    'E-mail',
    (emails) =>
      emails && emails.length > 1 ? (
        <ListExpandable
          className="ams-mb-l"
          expandButtonText="Toon alle websites"
          items={emails}
          renderItem={(email) => (
            <Link href={`mailto:${email}`} rel="noopener noreferrer">
              {email}
            </Link>
          )}
        />
      ) : emails?.length ? (
        <Link href={`mailto:${emails[0]}`} rel="noopener noreferrer">
          {emails[0]}
        </Link>
      ) : null,
  ],
  faxnummer: [
    'Fax',
    (faxnumbers) =>
      faxnumbers && faxnumbers.length > 1 ? (
        <ListExpandable
          className="ams-mb-l"
          expandButtonText="Toon alle websites"
          items={faxnumbers}
          renderItem={(number) => (
            <Link href={`fax:${number}`} rel="noopener noreferrer">
              {number}
            </Link>
          )}
        />
      ) : faxnumbers?.length ? (
        <Link href={`fax:${faxnumbers[0]}`} rel="noopener noreferrer">
          {faxnumbers[0]}
        </Link>
      ) : null,
  ],
  activiteiten: [
    'Activiteiten',
    (activiteiten) =>
      activiteiten && activiteiten.length > 1 ? (
        <ListExpandable
          expandButtonText="Toon alle activiteiten"
          items={activiteiten}
        />
      ) : (
        activiteiten?.[0]
      ),
  ],
};

const eigenaar: ProfileLabels<
  NatuurlijkPersoon | NietNatuurlijkPersoon,
  AppState['KVK']
> = {
  naam: 'Naam',
  rechtsvorm: 'Rechtsvorm',
  rsin: 'RSIN',
  adres: ['Adres', (address) => address],
};

export const labelConfig = {
  onderneming,
  vestiging,
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

function gestVestigingLabel(
  profileData: ReturnType<typeof formatKvkProfileData>
) {
  const labelPlural = profileData.hoofdVestiging
    ? 'Nevenvestigingen'
    : 'Vestigingen';
  const label =
    profileData.hoofdVestiging && profileData.vestigingen?.length === 1
      ? 'Nevenvestiging'
      : 'Vestiging';

  return profileData.vestigingen?.length !== 1
    ? `${labelPlural} (${profileData.vestigingen?.length})`
    : label;
}

export const panelConfig: PanelConfig<
  KVKPanelKey,
  AppState['KVK'],
  ReturnType<typeof formatKvkProfileData>
> = {
  onderneming: () => ({
    title: 'Onderneming',
    actionLinks: [],
  }),
  hoofdVestiging: () => ({
    title: 'Hoofdvestiging',
    actionLinks: [],
  }),
  vestigingen: (_, profileData) => {
    return {
      title: gestVestigingLabel(profileData),
      actionLinks: [],
    };
  },
  eigenaar: () => ({
    title: 'Eigenaar',
    actionLinks: [],
  }),
};

export const forTesting = {
  gestVestigingLabel,
};
