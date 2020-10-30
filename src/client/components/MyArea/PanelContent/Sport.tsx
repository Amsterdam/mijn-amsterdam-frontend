import React from 'react';
import { getDatasetGroupId } from '../../../../universal/config';
import InfoDetail from '../../InfoDetail/InfoDetail';
import { titleTransform } from '../datasets';
import Description from './Description';
import GenericBase from './GenericBase';
import JsonString from './JsonString';
import { capitalizeFirstLetter } from '../../../../universal/helpers/text';

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
          <JsonString data={panelItem} />
        </GenericBase>
      );
    case 'sportpark':
      return (
        <GenericBase title={panelItem.omschrijving} supTitle="Sportparken">
          {/* <JsonString data={panelItem} /> */}
        </GenericBase>
      );
    case 'sportveld':
      return (
        <GenericBase title={panelItem.sportfunctie} supTitle="Sportvelden">
          <InfoDetail
            label="Soort ondergrond"
            value={panelItem.soortOndergrond}
          />
          <InfoDetail label="Sportpark" value={panelItem.sportpark} />
          {/* <JsonString data={panelItem} /> */}
        </GenericBase>
      );
    case 'gymsportzaal':
      return (
        <GenericBase title={panelItem.naam} supTitle="Gymsportzalen">
          <JsonString data={panelItem} />
        </GenericBase>
      );
    case 'sporthal':
      return (
        <GenericBase title={panelItem.naam} supTitle="Sporthallen">
          <JsonString data={panelItem} />
        </GenericBase>
      );
    case 'sportaanbieder':
      return (
        <GenericBase title={panelItem.naamAanbieder} supTitle="Sportaanbieders">
          <InfoDetail label="Adres" value={panelItem.adres} />
          <JsonString data={panelItem} />
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
          <JsonString data={panelItem} />
        </GenericBase>
      );
    case 'hardlooproute':
      return (
        <GenericBase title={panelItem.naam} supTitle="Hardlooproutes">
          <JsonString data={panelItem} />
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
