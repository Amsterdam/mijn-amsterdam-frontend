import React, { useContext } from 'react';
import InfoPanel from 'components/InfoPanel/InfoPanel';
import { AppContext } from 'AppState';
import { defaultDateFormat } from 'helpers/App';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';
import styles from 'pages/Profile/Profile.module.scss';
import { brpInfoLabels, panelConfig } from './Profile.constants';
import { Chapters } from 'App.constants';
import ChapterHeadingIcon from 'components/ChapterHeadingIcon/ChapterHeadingIcon';

function formatProfileData({
  person = {},
  partner = {},
  address = {},
  maritalStatus = null,
}) {
  return {
    person: person && {
      [brpInfoLabels.FirstName]: person.firstName,
      [brpInfoLabels.LastName]: person.lastName,
      [brpInfoLabels.Gender]: person.gender,
      [brpInfoLabels.BSN]: person.bsn,
      [brpInfoLabels.DateOfBirth]: defaultDateFormat(person.dateOfBirth),
      [brpInfoLabels.PlaceOfBirth]: person.placeOfBirth,
      [brpInfoLabels.CountryOfBirth]: person.countryOfBirth,
    },
    partner: partner && {
      [brpInfoLabels.FirstName]: partner.firstName,
      [brpInfoLabels.LastName]: partner.lastName,
      [brpInfoLabels.BSN]: partner.bsn,
      [brpInfoLabels.DateOfBirth]: defaultDateFormat(partner.dateOfBirth),
    },
    maritalStatus: maritalStatus && {
      '': maritalStatus.type,
      [brpInfoLabels.Date]: defaultDateFormat(maritalStatus.dateStarted),
      [brpInfoLabels.Place]: maritalStatus.place,
      [brpInfoLabels.Country]: maritalStatus.country,
    },
    address: address.current && {
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
        {Object.entries(brpInfo)
          .filter(([id]) => !!brpInfo[id]) // check if object key has a truthy value associated.
          .map(([id, info]) => {
            return <InfoPanel key={id} {...panelConfig[id]} info={info} />;
          })}
      </PageContentMainBody>
    </PageContentMain>
  );
}
