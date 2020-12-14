import { themeSpacing } from '@amsterdam/asc-ui';
import React from 'react';
import styled from 'styled-components';
import {
  DatasetCategoryId,
  getDatasetCategoryId,
} from '../../../../universal/config/buurt';
import Alert from '../../Alert/Alert';
import LoadingContent from '../../LoadingContent/LoadingContent';
import { useLoadingFeature, useSelectedFeature } from '../MyArea.hooks';
import MyArePanelContentAfval from './Afval';
import MyArePanelContentBedrijvenInvesteringsZones from './BedrijvenInvesteringsZones';
import MyArePanelContentBekendmaking from './Bekendmaking';
import MyArePanelContentEvenementen from './Evenementen';
import { GenericContent } from './GenericBase';
import MyArePanelContentParkeren from './Parkeren';
import MyArePanelContentSport from './Sport';

const MyAreaPanelContent = styled.div`
  padding: ${themeSpacing(4, 0, 4, 0)};
`;

interface MyAreaPanelContentSwitchProps {
  datasetCategoryId: DatasetCategoryId;
  feature: any;
}

function MyAreaPanelContentSwitch({
  datasetCategoryId,
  feature,
}: MyAreaPanelContentSwitchProps) {
  switch (datasetCategoryId) {
    case 'sport':
      return (
        <MyArePanelContentSport
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'afvalcontainers':
      return (
        <MyArePanelContentAfval
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'evenementen':
      return (
        <MyArePanelContentEvenementen
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'bekendmakingen':
      return (
        <MyArePanelContentBekendmaking
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'parkeren':
      return (
        <MyArePanelContentParkeren
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'bedrijveninvesteringszones':
      return (
        <MyArePanelContentBedrijvenInvesteringsZones
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
  }
  return <GenericContent datasetId={feature?.datasetId} panelItem={feature} />;
}

export default function MyAreaDetailPanel() {
  const [selectedFeature] = useSelectedFeature();
  const [loadingFeature] = useLoadingFeature();

  if (!selectedFeature || !loadingFeature?.datasetId) {
    return <LoadingContent />;
  }

  if (loadingFeature?.isError) {
    return (
      <Alert type="warning">
        <p>
          Er kan op dit moment niet meer informatie getoond worden over dit
          item.
        </p>
      </Alert>
    );
  }

  const datasetCategoryId = getDatasetCategoryId(selectedFeature.datasetId);
  // const isLoading = selectedFeature.id !== loadingFeature.id;

  return (
    <MyAreaPanelContent>
      <MyAreaPanelContentSwitch
        datasetCategoryId={datasetCategoryId!}
        feature={selectedFeature}
      />
    </MyAreaPanelContent>
  );
}
