import { AppRoutes, Chapters } from '../../../universal/config';
import { defaultDateFormat } from '../../../universal/helpers';
import { PageTablePaginated } from '../../components/TablePagePaginated/TablePagePaginated';
import { DISPLAY_PROPS_HISTORY } from './Vergunningen';

export default function VergunningenList() {
  return (
    <PageTablePaginated
      stateKey="VERGUNNINGEN"
      listTitle="Alle eerdere aanvragen"
      title="Vergunningen"
      appRoute={AppRoutes.VERGUNNINGEN_EERDER}
      appRouteBack={AppRoutes.VERGUNNINGEN}
      displayProps={DISPLAY_PROPS_HISTORY}
      chapter={Chapters.VERGUNNINGEN}
      titleKey="identifier"
      mapFn={(item) => {
        return {
          ...item,
          dateRequest: defaultDateFormat(item.dateRequest),
        };
      }}
    />
  );
}
