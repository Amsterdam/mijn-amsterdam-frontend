import {
  DatasetCategoryId,
  getDatasetCategoryId,
} from '../../../../../universal/config/myarea-datasets';
import Alert from '../../../Alert/Alert';
import LoadingContent from '../../../LoadingContent/LoadingContent';
import { useLoadingFeature, useSelectedFeature } from '../../MyArea.hooks';
import styles from '../PanelComponent.module.scss';
import MyArePanelContentAfval from './Afval';
import MyArePanelContentBedrijvenInvesteringsZones from './BedrijvenInvesteringsZones';
import MyArePanelContentBekendmaking from './Bekendmaking';
import MyArePanelContentEvenementen from './Evenementen';
import { GenericContent } from './GenericBase';
import MyArePanelContentMeldingenBuurt from './MeldingenBuurt';
import MyArePanelContentParkeren from './Parkeren';
import MyArePanelContentSport from './Sport';
import MyArePanelContentWIOR from './Wior';

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
    case 'wior':
      return (
        <MyArePanelContentWIOR
          datasetId={feature?.datasetId}
          panelItem={feature}
        />
      );
    case 'meldingenBuurt':
      return (
        <MyArePanelContentMeldingenBuurt
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
      <Alert className={styles.PanelError} type="warning">
        <p>
          Er kan op dit moment geen informatie getoond worden over deze locatie.
        </p>
      </Alert>
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
