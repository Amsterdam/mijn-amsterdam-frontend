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
    <GenericBase title={title} supTitle="Laadpalen">
      {!!panelItem.connector_type && (
        <InfoDetail label="Connector type" value={panelItem.connector_type} />
      )}
      {!!panelItem.charging_cap_max && (
        <InfoDetail
          label="Wattage"
          value={`${panelItem.charging_cap_max}Kwh`}
        />
      )}
    </GenericBase>
  );
}
