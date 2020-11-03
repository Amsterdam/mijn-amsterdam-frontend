import React from 'react';
import DateStartEnd from './DateStartEnd';
import Description from './Description';
import GenericBase from './GenericBase';
import Url from './Url';

interface MyArePanelContentEvenementenProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentEvenementen({
  datasetId,
  panelItem,
}: MyArePanelContentEvenementenProps) {
  return (
    <GenericBase title={panelItem.titel} supTitle="Evenementenen">
      {panelItem.startdatum && panelItem.einddatum && (
        <DateStartEnd
          dateStart={panelItem.startdatum}
          dateEnd={panelItem.einddatum}
          timeStart={panelItem.starttijd}
          timeEnd={panelItem.eindtijd}
        />
      )}
      {!!panelItem.omschrijving && (
        <Description description={panelItem.omschrijving} />
      )}
      {!!panelItem.url && <Url url={panelItem.url} />}
    </GenericBase>
  );
}
