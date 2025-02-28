import GenericBase from './GenericBase';
import Url from './Url';
import { defaultDateFormat } from '../../../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../../../universal/helpers/text';
import { Unshaped } from '../../../../../universal/types/App.types';
import { Datalist, Row } from '../../../Datalist/Datalist';

interface MyArePanelContentBekendmakingProps {
  panelItem: Unshaped;
  datasetId: string;
}

export default function MyArePanelContentBekendmaking({
  datasetId,
  panelItem,
}: MyArePanelContentBekendmakingProps) {
  const rows: Row[] = [
    {
      label: 'Datum',
      content: panelItem.datePublished
        ? defaultDateFormat(panelItem.datePublished)
        : '',
    },
    {
      label: 'Categorie',
      content: panelItem.categorie,
    },
    {
      label: 'Datum Tijdstip',
      content: panelItem.datumTijdstip,
    },
    {
      label: 'Beschrijving',
      content: panelItem.beschrijving,
    },
    {
      label: 'URL',
      content: <Url url={panelItem.url} />,
      isVisible: !!panelItem.url,
    },
  ].filter((row) =>
    typeof row.isVisible !== 'undefined' ? row.isVisible : !!row.content
  );

  return (
    <GenericBase
      title={capitalizeFirstLetter(panelItem.onderwerp)}
      supTitle="Vergunningen en ontheffingen"
    >
      <Datalist rows={rows} />
    </GenericBase>
  );
}
