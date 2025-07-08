import {
  DatasetCategoryId,
  getDatasetCategoryId,
} from '../../../../../universal/config/myarea-datasets.ts';
import ErrorAlert from '../../../Alert/Alert.tsx';
import LoadingContent from '../../../LoadingContent/LoadingContent.tsx';
import { useLoadingFeature, useSelectedFeature } from '../../MyArea.hooks.ts';
import styles from '../PanelComponent.module.scss';
import MyAreaPanelContentAfval from './Afval.tsx';
import MyAreaPanelContentBedrijvenInvesteringsZones from './BedrijvenInvesteringsZones.tsx';
import MyAreaPanelContentBekendmaking from './Bekendmaking.tsx';
import { GenericContent } from './GenericBase.tsx';
import MyAreaPanelContentLaadpalen from './Laadpalen.tsx';
import MyAreaPanelContentMeldingenBuurt from './MeldingenBuurt.tsx';
import MyAreaPanelContentParkeren from './Parkeren.tsx';
import MyAreaPanelContentSport from './Sport.tsx';
import MyAreaPanelContentWIOR from './Wior.tsx';

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
    case 'laadpalen':
      return (
        <MyAreaPanelContentLaadpalen
          panelItem={feature}
          datasetId={feature?.datasetId}
        />
      );
  }
  return <GenericContent datasetId={feature?.datasetId} panelItem={feature} />;
}

export default function MyAreaDetailPanel() {
  const [selectedFeature] = useSelectedFeature();
  const [loadingFeature] = useLoadingFeature();

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

  if (loadingFeature?.isError) {
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
