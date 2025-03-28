import GenericBase from './GenericBase';
import Url from './Url';
import InfoDetail from '../../../InfoDetail/InfoDetail';

interface MyArePanelContentBedrijvenInvesteringsZonesProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentBedrijvenInvesteringsZones({
  datasetId,
  panelItem,
}: MyArePanelContentBedrijvenInvesteringsZonesProps) {
  return (
    <GenericBase title={panelItem.naam} supTitle="Bedrijveninvesteringszones">
      {!!panelItem.heffingsgrondslag && (
        <InfoDetail
          label="Heffingsgrondslag"
          value={panelItem.heffingsgrondslag}
        />
      )}
      {!!panelItem.heffingstariefDisplay && (
        <InfoDetail
          label="Heffingstarief"
          value={panelItem.heffingstariefDisplay}
        />
      )}
      {!!panelItem.verordening && (
        <Url label="Verordening" url={panelItem.verordening} />
      )}
      {!!panelItem.website && <Url label="Website" url={panelItem.website} />}
    </GenericBase>
  );
}
