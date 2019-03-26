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
  me = {},
  partner = {},
  address = {},
  legalCommitment = null,
}) {
  return {
    me: me && {
      [brpInfoLabels.FirstName]: me.voornamen,
      [brpInfoLabels.LastName]: me.geslachtsnaam,
      [brpInfoLabels.Gender]: me.omschrijvingGeslachtsaanduiding,
      [brpInfoLabels.BSN]: me.bsn,
      [brpInfoLabels.DateOfBirth]: defaultDateFormat(me.geboortedatum),
      [brpInfoLabels.PlaceOfBirth]: me.geboorteplaatsnaam,
      [brpInfoLabels.CountryOfBirth]: me.geboortelandnaam,
    },
    partner: partner && {
      [brpInfoLabels.FirstName]: partner.voornamen,
      [brpInfoLabels.LastName]: partner.geslachtsnaam,
      [brpInfoLabels.BSN]: me.bsn,
      [brpInfoLabels.DateOfBirth]: defaultDateFormat(partner.geboortedatum),
    },
    legalCommitment: legalCommitment && {
      '': legalCommitment.type,
      [brpInfoLabels.Date]: defaultDateFormat(legalCommitment.dateStarted),
      [brpInfoLabels.Place]: legalCommitment.place,
      [brpInfoLabels.Country]: legalCommitment.country,
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
      <ChapterHeadingIcon chapter={Chapters.BURGERZAKEN} />
      <PageContentMainHeading>Mijn gegevens</PageContentMainHeading>
      <PageContentMainBody>
        <p>
          In de Basisregistratie Personen legt de gemeente persoonsgegevens over
          u vast. Het gaat hier bijvoorbeeld om uw geboortedatum, uw woonadres,
          wanneer u verhuisd bent en of u getrouwd bent of kinderen hebt. Deze
          gegevens zijn de basis voor de processen van de gemeente. Belangrijk
          dus dat deze gegevens kloppen.
        </p>
        {Object.entries(brpInfo)
          .filter(([id]) => !!brpInfo[id])
          .map(([id, info]) => {
            return <InfoPanel key={id} {...panelConfig[id]} info={info} />;
          })}
      </PageContentMainBody>
    </PageContentMain>
  );
}
