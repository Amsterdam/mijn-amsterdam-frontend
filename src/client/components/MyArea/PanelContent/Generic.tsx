import React from 'react';
import { getDatasetCategoryId } from '../../../../universal/config/buurt';
import LoadingContent from '../../LoadingContent/LoadingContent';
import MyArePanelContentAfval from './Afval';
import MyArePanelContentBekendmaking from './Bekendmaking';
import MyArePanelContentEvenementen from './Evenementen';
import { GenericContent } from './GenericBase';
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

  const datasetCategoryId = getDatasetCategoryId(datasetId);

  switch (datasetCategoryId) {
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

  return <GenericContent datasetId={datasetId} panelItem={panelItem} />;
}
