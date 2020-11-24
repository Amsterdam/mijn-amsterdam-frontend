import React from 'react';
import { getDatasetCategoryId } from '../../../../universal/config/buurt';
import LoadingContent from '../../LoadingContent/LoadingContent';
import { titleTransform } from '../datasets';
import MyArePanelContentAfval from './Afval';
import MyArePanelContentBekendmaking from './Bekendmaking';
import MyArePanelContentEvenementen from './Evenementen';
import GenericBase from './GenericBase';
import JsonString from './JsonString';
import MyArePanelContentParkeren from './Parkeren';
import MyArePanelContentSport from './Sport';

interface MyAreaPanelContentGenericProps {
  panelItem: any;
  datasetId: string;
}

export default function MyAreaPanelContentGeneric({
  datasetId,
  panelItem,
}: MyAreaPanelContentGenericProps) {
  if (!panelItem) {
    return <LoadingContent />;
  }

  switch (getDatasetCategoryId(datasetId)) {
    case 'sport':
      return (
        <MyArePanelContentSport datasetId={datasetId} panelItem={panelItem} />
      );
    case 'afvalcontainers':
      return (
        <MyArePanelContentAfval datasetId={datasetId} panelItem={panelItem} />
      );
    case 'evenementen':
      return (
        <MyArePanelContentEvenementen
          datasetId={datasetId}
          panelItem={panelItem}
        />
      );
    case 'bekendmakingen':
      return (
        <MyArePanelContentBekendmaking
          datasetId={datasetId}
          panelItem={panelItem}
        />
      );
    case 'parkeren':
      return (
        <MyArePanelContentParkeren
          datasetId={datasetId}
          panelItem={panelItem}
        />
      );
  }

  return (
    <GenericBase
      title={titleTransform(datasetId)}
      supTitle={titleTransform(getDatasetCategoryId(datasetId))}
    >
      <JsonString data={panelItem} />
    </GenericBase>
  );
}
