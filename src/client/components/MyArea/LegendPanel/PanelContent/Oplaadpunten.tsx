import GenericBase from './GenericBase';
import { InfoDetail } from '../../../index';
import { laadpaalValueConfig } from '../../../../../universal/config';

type Props = {
  panelItem: any;
  datasetId: string;
};

export default function MyArePanelContentLaadpalen({
  datasetId,
  panelItem,
}: Props) {
  const connectorTypes = panelItem.connector_type.split(';');

  return (
    <GenericBase title={panelItem.name} supTitle="Laadpalen">
      {!!panelItem.connector_type && (
        <InfoDetail
          label={`Connector type${connectorTypes.length > 1 ? 's' : ''}`}
          value={connectorTypes
            .map(
              (type: string) =>
                laadpaalValueConfig[type as keyof typeof laadpaalValueConfig]
            )
            .join(', ')}
        />
      )}
      <InfoDetail
        label="Adres"
        value={`${panelItem.street} ${panelItem.housenumber}`}
      />
      <InfoDetail label="Provider" value={panelItem.provider} />
      <InfoDetail label={'Snellader'} value={panelItem.snellader} />
      {!!panelItem.charging_cap_max && (
        <InfoDetail
          label="Maximum wattage"
          value={`${panelItem.charging_cap_max}Kwh`}
        />
      )}
    </GenericBase>
  );
}
