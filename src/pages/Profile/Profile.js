import React, { useContext } from 'react';
import InfoPanel from 'components/InfoPanel/InfoPanel';
import AppContext from 'App.context';
import { defaultDateFormat } from 'helpers/App';
import PageContentMain from 'components/PageContentMain/PageContentMain';
import PageContentMainHeading from 'components/PageContentMainHeading/PageContentMainHeading';
import PageContentMainBody from 'components/PageContentMainBody/PageContentMainBody';

const panelConfig = {
  me: {
    title: 'Persoonlijke gegevens',
    actionLinks: [
      {
        label: 'Inzien of correctie doorgeven',
        url: '',
      },
    ],
  },
  partner: {
    title: 'Partner',
    actionLinks: [
      {
        label: 'Inzien of correctie doorgeven',
        url: '',
      },
    ],
  },
  legalCommitment: {
    title: 'Verbintenis',
    actionLinks: [
      {
        label: 'Trouwen en partnerschap',
        url: '',
      },
      {
        label: 'Echtscheiding',
        url: '',
      },
    ],
  },
  address: {
    title: 'Huidig woonadres',
    actionLinks: [
      {
        label: 'Verhuizing doorgeven',
        url: '',
      },
    ],
  },
};

const brpInfoLabels = {
  FirstName: 'Voornamen',
  LastName: 'Achternaam',
  Gender: 'Geslacht',
  BSN: 'Bsn',
  DateOfBirth: 'Geboortedatum',
  PlaceOfBirth: 'Geboorteplaats',
  CountryOfBirth: 'Geboorteland',
  Nationality: 'Nationaliteit',
  Date: 'Datum',
  Place: 'Plaats',
  Country: 'Land',
  DateStarted: 'Sinds',
};

export default function Profile() {
  const {
    BRP: { me = {}, partner = {}, address = {}, legalCommitment = null },
  } = useContext(AppContext);

  const brpInfo = {
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

  return (
    <PageContentMain>
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
