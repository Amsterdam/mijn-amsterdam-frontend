import GenericBase from './GenericBase';
import { InfoDetail } from '../../../index';

type Props = {
  panelItem: any;
  datasetId: string;
};

export default function MyArePanelContentLaadpalen({
  datasetId,
  panelItem,
}: Props) {
  let title = '';
  if (panelItem.availability === 'normaal_beschikbaar') {
    title = 'Normaal beschikbaar';
  } else if (panelItem.availability === 'snel_beschikbaar') {
    title = 'Snel beschikbaar';
  }

  return (
    <GenericBase title={panelItem.name} supTitle="Laadpalen">
      {!!panelItem.connector_type && (
        <InfoDetail label="Connector type" value={panelItem.connector_type} />
      )}
      <InfoDetail label="Snelllader" value="--snelllader--" />
      <InfoDetail label="Provider" value="--provider--" />
      <InfoDetail label="Adres" value="--adres--" />
      {!!panelItem.charging_cap_max && (
        <InfoDetail
          label="Maximum wattage"
          value={`${panelItem.charging_cap_max}Kwh`}
        />
      )}
    </GenericBase>
  );
}
