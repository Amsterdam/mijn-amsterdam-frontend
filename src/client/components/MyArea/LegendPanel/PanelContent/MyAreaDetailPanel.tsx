import {
  DatasetCategoryId,
  getDatasetCategoryId,
} from '../../../../../universal/config/myarea-datasets';
import ErrorAlert from '../../../Alert/Alert';
import LoadingContent from '../../../LoadingContent/LoadingContent';
import { useLoadingFeature, useSelectedFeature } from '../../MyArea.hooks';
import styles from '../PanelComponent.module.scss';
import MyAreaPanelContentAfval from './Afval';
import MyAreaPanelContentBedrijvenInvesteringsZones from './BedrijvenInvesteringsZones';
import MyAreaPanelContentBekendmaking from './Bekendmaking';
import { GenericContent } from './GenericBase';
import MyAreaPanelContentMeldingenBuurt from './MeldingenBuurt';
import MyAreaPanelContentParkeren from './Parkeren';
import MyAreaPanelContentSport from './Sport';
import MyAreaPanelContentWIOR from './Wior';

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
        <MyAreaPanelContentSport
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'afvalcontainers':
      return (
        <MyAreaPanelContentAfval
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'bekendmakingen':
      return (
        <MyAreaPanelContentBekendmaking
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'parkeren':
      return (
        <MyAreaPanelContentParkeren
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'bedrijveninvesteringszones':
      return (
        <MyAreaPanelContentBedrijvenInvesteringsZones
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'wior':
      return (
        <MyAreaPanelContentWIOR
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'meldingenBuurt':
      return (
        <MyAreaPanelContentMeldingenBuurt
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
  }
  return <GenericContent datasetId={feature?.datasetId} panelItem={feature} />;
}

export default function MyAreaDetailPanel() {
  const { selectedFeature } = useSelectedFeature();
  const { loadingFeature } = useLoadingFeature();

  if (
    (!selectedFeature ||
      !loadingFeature?.datasetId ||
      selectedFeature.id !== loadingFeature?.id) &&
    !loadingFeature?.isError
  ) {
    return (
      <div className={styles.panelContent}>
        <LoadingContent />
      </div>
    );
  }

  if (loadingFeature?.isError || !selectedFeature) {
    return (
      <ErrorAlert>
        Er kan op dit moment geen informatie getoond worden over deze locatie.
      </ErrorAlert>
    );
  }

  const datasetCategoryId = getDatasetCategoryId(selectedFeature.datasetId);

  return (
    <div className={styles.panelContent}>
      <MyAreaPanelContentSwitch
        datasetCategoryId={datasetCategoryId!}
        feature={selectedFeature}
      />
    </div>
  );
}
