import { InfoDetail } from '../../..';
import GenericBase from './GenericBase';
import { dateTimeFormatYear } from '../../../../../universal/helpers/date';
import { DATASETS } from '../../../../../universal/config/buurt';
import { capitalizeFirstLetter } from '../../../../../universal/helpers';

interface MyArePanelContentMeldingenBuurtProps {
  panelItem: any;
  datasetId: string;
}

function displayCategoryTitle(category: string) {
  const displayCategory = capitalizeFirstLetter(category);
  const config =
    DATASETS.meldingenBuurt.datasets.meldingenBuurt?.filters?.categorie
      ?.valueConfig?.[displayCategory];

  return config?.title ?? displayCategory;
}

export default function MyArePanelContentMeldingenBuurt({
  datasetId,
  panelItem,
}: MyArePanelContentMeldingenBuurtProps) {
  return (
    <GenericBase
      title={displayCategoryTitle(panelItem.categorie)}
      supTitle="Meldingen"
    >
      {!!panelItem.datumCreatie && (
        <InfoDetail
          label="Datum en tijd melding"
          value={dateTimeFormatYear(panelItem.datumCreatie)}
        />
      )}
    </GenericBase>
  );
}
