import GenericBase from './GenericBase';
import { DATASETS } from '../../../../../universal/config/myarea-datasets';
import { dateTimeFormatYear } from '../../../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../../../universal/helpers/text';
import { Unshaped } from '../../../../../universal/types';
import { Datalist, Row } from '../../../Datalist/Datalist';

interface MyArePanelContentMeldingenBuurtProps {
  panelItem: Unshaped;
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
  const rows: Row[] = [
    {
      label: 'Subcategorie',
      content: panelItem.subcategory,
      isVisible: !!panelItem.subcategory,
    },
    {
      label: 'Datum en tijd melding',
      content: dateTimeFormatYear(panelItem.dateCreated),
      isVisible: !!panelItem.dateCreated,
    },
  ];
  return (
    <GenericBase
      supTitle="Meldingen"
      title={displayCategoryTitle(panelItem.category)}
    >
      <Datalist rows={rows} />
    </GenericBase>
  );
}
