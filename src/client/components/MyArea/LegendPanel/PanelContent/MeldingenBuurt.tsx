import { InfoDetail } from '../../..';
import GenericBase from './GenericBase';
import { dateTimeFormatYear } from '../../../../../universal/helpers/date';

interface MyArePanelContentMeldingenBuurtProps {
  panelItem: any;
  datasetId: string;
}

export default function MyArePanelContentMeldingenBuurt({
  datasetId,
  panelItem,
}: MyArePanelContentMeldingenBuurtProps) {
  return (
    <GenericBase title={panelItem.categorie} supTitle="Meldingen">
      {!!panelItem.datumCreatie && (
        <InfoDetail
          label="Datum en tijd melding"
          value={dateTimeFormatYear(panelItem.datumCreatie)}
        />
      )}
    </GenericBase>
  );
}
