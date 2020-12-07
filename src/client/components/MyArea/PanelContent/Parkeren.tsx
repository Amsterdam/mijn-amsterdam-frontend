import React from 'react';
import GenericBase from './GenericBase';

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
    />
  );
}
