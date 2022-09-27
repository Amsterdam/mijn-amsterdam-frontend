import { AppRoutes, Chapters } from '../../../universal/config';
import { defaultDateFormat } from '../../../universal/helpers';
import { PageTablePaginated } from '../../components/TablePagePaginated/TablePagePaginated';
import { DISPLAY_PROPS } from './Vergunningen';

export default function VergunningenList() {
  return (
    <PageTablePaginated
      stateKey="VERGUNNINGEN"
      listTitle="Alle lopende aanvragen"
      title="Vergunningen"
      appRoute={AppRoutes.VERGUNNINGEN_LOPEND}
      appRouteBack={AppRoutes.VERGUNNINGEN}
      displayProps={DISPLAY_PROPS}
      titleKey="identifier"
      chapter={Chapters.VERGUNNINGEN}
      mapFn={(item) => {
        return {
          ...item,
          dateRequest: defaultDateFormat(item.dateRequest),
        };
      }}
    />
  );
}
