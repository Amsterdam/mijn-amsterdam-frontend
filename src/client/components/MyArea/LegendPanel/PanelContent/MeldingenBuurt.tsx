import GenericBase from './GenericBase';
import { InfoDetail } from '../../..';
import { DATASETS } from '../../../../../universal/config/myarea-datasets';
import { dateTimeFormatYear } from '../../../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../../../universal/helpers/text';

interface MyArePanelContentMeldingenBuurtProps {
  panelItem: any;
  datasetId: string;
}

function displayCategoryTitle(category: string) {
  const displayCategory = capitalizeFirstLetter(category);
  const config =
    DATASETS.meldingenBuurt.datasets.meldingenBuurt?.filters?.category
      ?.valueConfig?.[displayCategory];

  return config?.title ?? displayCategory;
}

export default function MyArePanelContentMeldingenBuurt({
  datasetId,
  panelItem,
}: MyArePanelContentMeldingenBuurtProps) {
  console.log('panelItem', panelItem);
  return (
    <GenericBase
      supTitle="Meldingen"
      title={displayCategoryTitle(panelItem.category)}
    >
      {!!panelItem.subcategory && (
        <InfoDetail label="Subcategorie" value={panelItem.subcategory} />
      )}
      {!!panelItem.dateCreated && (
        <InfoDetail
          label="Datum en tijd melding"
          value={dateTimeFormatYear(panelItem.dateCreated)}
        />
      )}
    </GenericBase>
  );
}
