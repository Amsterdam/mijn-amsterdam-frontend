import React, { useContext } from 'react';
import InfoPanel from 'components/InfoPanel/InfoPanel';
import { AppContext } from 'AppState';
import { defaultDateFormat, entries } from 'helpers/App';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from 'pages/Profile/Profile.module.scss';
import { brpInfoLabels, panelConfig } from './Profile.constants';
import { Chapters } from 'App.constants';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';
import { BrpApiState } from 'hooks/api/brp-api.hook';
import Alert from 'components/Alert/Alert';
import LoadingContent from 'components/LoadingContent/LoadingContent';

// NOTE: Preferred simple interface here.
interface ProfileData {
  person?: {
    [label: string]: string | number;
  };
  partner?: {
    [label: string]: string | number;
  };
  maritalStatus?: {
    [label: string]: string;
  };
  address?: {
    [label: string]: string;
  };
}

function formatProfileData({
  person,
  partner,
  address,
  maritalStatus,
}: BrpApiState): ProfileData | null {
  if (!(person && partner && address && address.current && maritalStatus)) {
    return null;
  }
  return {
    person: {
      [brpInfoLabels.FirstName]: person.firstName,
      [brpInfoLabels.LastName]: person.lastName,
      [brpInfoLabels.Gender]: person.gender,
      [brpInfoLabels.BSN]: person.bsn,
      [brpInfoLabels.DateOfBirth]: defaultDateFormat(person.dateOfBirth),
      [brpInfoLabels.PlaceOfBirth]: person.placeOfBirth,
      [brpInfoLabels.CountryOfBirth]: person.countryOfBirth,
    },
    partner: {
      [brpInfoLabels.FirstName]: partner.firstName,
      [brpInfoLabels.LastName]: partner.lastName,
      [brpInfoLabels.BSN]: partner.bsn,
      [brpInfoLabels.DateOfBirth]: defaultDateFormat(partner.dateOfBirth),
    },
    maritalStatus: {
      '': maritalStatus.type,
      [brpInfoLabels.Date]: defaultDateFormat(maritalStatus.dateStarted),
      [brpInfoLabels.Place]: maritalStatus.place,
      [brpInfoLabels.Country]: maritalStatus.country,
    },
    address: {
      '': address.current.locality,
      [brpInfoLabels.DateStarted]: defaultDateFormat(
        address.current.dateStarted
      ),
    },
  };
}

export default function Profile() {
  const { BRP } = useContext(AppContext);
  const brpInfo = formatProfileData(BRP);

  return (
    <PageContentMain className={styles.Profile}>
      <PageContentMainHeading variant="withIcon">
        <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
        Mijn gegevens
      </PageContentMainHeading>
      <PageContentMainBody>
        <p>
          In de Basisregistratie Personen legt de gemeente persoonsgegevens over
          u vast. Het gaat hier bijvoorbeeld om uw geboortedatum, uw woonadres,
          wanneer u verhuisd bent en of u getrouwd bent of kinderen hebt. Deze
          gegevens zijn de basis voor de processen van de gemeente. Belangrijk
          dus dat deze gegevens kloppen.
        </p>
        {BRP.isLoading && (
          <div className={styles.LoadingContent}>
            <LoadingContent />
            <LoadingContent />
            <LoadingContent />
          </div>
        )}
        {BRP.isError && (
          <Alert type="warning">
            Uw gegevens kunnen op dit moment niet worden getoond.
          </Alert>
        )}
        {brpInfo &&
          entries(brpInfo).map(
            ([id, panelData]) =>
              panelData && ( // TS compiler complains when using regular filtering.
                <InfoPanel
                  key={id}
                  {...panelConfig[id]}
                  panelData={panelData}
                />
              )
          )}
      </PageContentMainBody>
    </PageContentMain>
  );
}
