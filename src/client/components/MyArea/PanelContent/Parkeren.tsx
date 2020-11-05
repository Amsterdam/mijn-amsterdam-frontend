import React from 'react';
import Description from './Description';
import GenericBase from './GenericBase';
import Url from './Url';

interface MyArePanelContentParkerenProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentParkeren({
  datasetId,
  panelItem,
}: MyArePanelContentParkerenProps) {
  return (
    <GenericBase
      title={panelItem.gebiedsnaam}
      supTitle={
        datasetId === 'parkeerzones_uitzondering'
          ? 'Vergunningsgebied uitzondering'
          : 'Vergunningsgebied'
      }
    >
      {!!panelItem.gebiedsomschrijving && (
        <Description description={panelItem.gebiedsomschrijving} />
      )}
      {!!panelItem.url && <Url url={panelItem.url} />}
    </GenericBase>
  );
}
