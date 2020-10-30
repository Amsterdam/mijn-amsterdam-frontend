import React from 'react';
import { getDatasetGroupId } from '../../../../universal/config/buurt';
import LoadingContent from '../../LoadingContent/LoadingContent';
import { titleTransform } from '../datasets';
import MyArePanelContentAfval from './Afval';
import MyArePanelContentBekendmaking from './Bekendmaking';
import GenericBase from './GenericBase';
import JsonString from './JsonString';
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

  switch (getDatasetGroupId(datasetId)) {
    case 'sport':
      return (
        <MyArePanelContentSport datasetId={datasetId} panelItem={panelItem} />
      );
    case 'afvalcontainers':
      return (
        <GenericBase
          title={titleTransform(datasetId)}
          supTitle={titleTransform(getDatasetGroupId(datasetId))}
        >
          <MyArePanelContentAfval datasetId={datasetId} panelItem={panelItem} />
        </GenericBase>
      );
    case 'bekendmakingen':
      return (
        <GenericBase
          title={titleTransform(datasetId)}
          supTitle={titleTransform(getDatasetGroupId(datasetId))}
        >
          <MyArePanelContentBekendmaking
            datasetId={datasetId}
            panelItem={panelItem}
          />
        </GenericBase>
      );
    case 'parkeren':
      return (
        <GenericBase title={panelItem.gebiedsnaam} supTitle="Vergunningsgebied">
          <MyArePanelContentBekendmaking
            datasetId={datasetId}
            panelItem={panelItem}
          />
        </GenericBase>
      );
  }

  return (
    <GenericBase
      title={titleTransform(datasetId)}
      supTitle={titleTransform(getDatasetGroupId(datasetId))}
    >
      <JsonString data={panelItem} />
    </GenericBase>
  );
}
