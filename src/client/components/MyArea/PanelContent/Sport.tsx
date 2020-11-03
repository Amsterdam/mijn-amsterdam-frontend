import React from 'react';
import { getDatasetGroupId } from '../../../../universal/config';
import InfoDetail from '../../InfoDetail/InfoDetail';
import { titleTransform } from '../datasets';
import Description from './Description';
import GenericBase from './GenericBase';
import JsonString from './JsonString';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';
import Url from './Url';

interface MyArePanelContentSportProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentSport({
  datasetId,
  panelItem,
}: MyArePanelContentSportProps) {
  switch (datasetId) {
    case 'zwembad':
      return (
        <GenericBase title={panelItem.naam} supTitle="Zwembaden">
          <InfoDetail label="Adres" value={panelItem.adres} />
          {!!panelItem.emailadres && (
            <Url
              label="E-mail"
              url={`mailto:${panelItem.emailadres}`}
              urlTitle={panelItem.emailadres}
            />
          )}
          {!!panelItem.website && <Url url={panelItem.website} />}
        </GenericBase>
      );
    case 'sportpark':
      return (
        <GenericBase title={panelItem.omschrijving} supTitle="Sportparken" />
      );
    case 'sportveld':
      return (
        <GenericBase title={panelItem.sportfunctie} supTitle="Sportvelden">
          <InfoDetail
            label="Soort ondergrond"
            value={panelItem.soortOndergrond.replace('ï¿½', '&')}
          />
          <InfoDetail label="Sportpark" value={panelItem.sportpark} />
        </GenericBase>
      );
    case 'gymsportzaal':
      return (
        <GenericBase title={panelItem.naam} supTitle="Gymsportzalen">
          <InfoDetail label="Adres" value={panelItem.adres} />
          {!!panelItem.emailadres && (
            <Url
              label="E-mail"
              url={`mailto:${panelItem.emailadres}`}
              urlTitle={panelItem.emailadres}
            />
          )}
          {!!panelItem.website && <Url url={panelItem.website} />}
        </GenericBase>
      );
    case 'sporthal':
      return (
        <GenericBase title={panelItem.naam} supTitle="Sporthallen">
          <InfoDetail label="Adres" value={panelItem.adres} />
          {!!panelItem.emailadres && (
            <Url
              label="E-mail"
              url={`mailto:${panelItem.emailadres}`}
              urlTitle={panelItem.emailadres}
            />
          )}
          {!!panelItem.website && <Url url={panelItem.website} />}
        </GenericBase>
      );
    case 'sportaanbieder':
      return (
        <GenericBase title={panelItem.naamAanbieder} supTitle="Sportaanbieders">
          <InfoDetail label="Adres" value={panelItem.adres} />
          {!!panelItem.website && <Url url={panelItem.website} />}
        </GenericBase>
      );
    case 'openbaresportplek':
      return (
        <GenericBase
          title={`${panelItem.sportvoorziening}`}
          supTitle="Openbare sportplekken"
        >
          {!!panelItem.naam && (
            <InfoDetail
              label="Locatie"
              value={capitalizeFirstLetter(panelItem.naam.toLowerCase())}
            />
          )}
          {!!panelItem.omschrijving && (
            <Description description={panelItem.omschrijving} />
          )}
          {!!panelItem.soortLocatie && (
            <InfoDetail label="Soort locatie" value={panelItem.soortLocatie} />
          )}
        </GenericBase>
      );
    case 'hardlooproute':
      return (
        <GenericBase title={panelItem.naam} supTitle="Hardlooproutes">
          {/* <JsonString data={panelItem} /> */}
        </GenericBase>
      );
  }
  return (
    <GenericBase
      title={titleTransform(datasetId)}
      supTitle={titleTransform(getDatasetGroupId(datasetId))}
    >
      <JsonString data={panelItem} />;
    </GenericBase>
  );
}
