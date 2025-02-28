import GenericBase from './GenericBase';
import Url from './Url';
import { Unshaped } from '../../../../../universal/types/App.types';
import { Datalist, Row } from '../../../Datalist/Datalist';

interface MyArePanelContentBedrijvenInvesteringsZonesProps {
  panelItem: Unshaped;
  datasetId: string;
}

export default function MyArePanelContentBedrijvenInvesteringsZones({
  datasetId,
  panelItem,
}: MyArePanelContentBedrijvenInvesteringsZonesProps) {
  const rows: Row[] = [
    {
      label: 'Heffingsgrondslag',
      content: panelItem.heffingsgrondslag,
      isVisible: !!panelItem.heffingsgrondslag,
    },
    {
      label: 'Heffingstarief',
      content: panelItem.heffingstariefDisplay,
      isVisible: !!panelItem.heffingstariefDisplay,
    },
    {
      isVisible: !!panelItem.verordening,
      label: 'Verordening',
      content: <Url url={panelItem.verordening} />,
    },
    {
      isVisible: !!panelItem.website,
      label: 'Website',
      content: <Url url={panelItem.website} />,
    },
  ];

  return (
    <GenericBase title={panelItem.naam} supTitle="Bedrijveninvesteringszones">
      <Datalist rows={rows} />
    </GenericBase>
  );
}
