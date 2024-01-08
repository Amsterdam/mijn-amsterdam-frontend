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
  const url = panelItem.url;
  const typeName = url.split('TYPENAMES=')[1].split('&')[0];
  let title;
  if (typeName === 'ms:normaal_beschikbaar') {
    title = 'Beschikbaar';
  } else if (typeName === 'ms:snel_beschikbaar') {
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
