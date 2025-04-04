import GenericBase from './GenericBase';
import { defaultDateFormat } from '../../../../../universal/helpers/date';
import { Unshaped } from '../../../../../universal/types';
import { Datalist, Row, RowSet } from '../../../Datalist/Datalist';

interface MyArePanelContentWIORProps {
  panelItem: Unshaped;
  datasetId: string;
}

export default function MyArePanelContentWIOR({
  datasetId,
  panelItem,
}: MyArePanelContentWIORProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Projectnummer',
      content: panelItem.wiorNummer,
      isVisible: !!panelItem.wiorNummer,
    },
    {
      label: 'Projectnaam',
      content: panelItem.projectnaam,
      isVisible: !!panelItem.projectnaam,
    },
    {
      label: 'Werkzaamheden',
      content: panelItem.beschrijving,
      isVisible: !!panelItem.beschrijving,
    },
    {
      label: 'Geplande uitvoering',
      rows: [
        {
          label: `Datum ${panelItem.datumStartUitvoering !== panelItem.datumEindeUitvoering ? 'van' : ''}`,
          content: defaultDateFormat(panelItem.datumStartUitvoering),
        },
        {
          label: 'Datum tot en met',
          content: defaultDateFormat(panelItem.datumEindeUitvoering),
        },
      ],
      isVisible: !!(
        panelItem.datumStartUitvoering && panelItem.datumEindeUitvoering
      ),
    },
  ];

  return (
    <GenericBase
      title={`Projectnummer: ${panelItem.wiorNummer}`}
      supTitle="Werk in de openbare ruimte (WIOR)"
    >
      <Datalist rows={rows} />
    </GenericBase>
  );
}
