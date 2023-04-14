import { Vergunning } from '../../../server/services';
import { AppRoutes, Chapters } from '../../../universal/config';
import {
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { PageTablePaginated } from '../../components/TablePagePaginated/TablePagePaginated';
import { useAppStateGetter } from '../../hooks';
import { DISPLAY_PROPS_HISTORY } from './Vergunningen';

export default function VergunningenList() {
  const { VERGUNNINGEN } = useAppStateGetter();
  const items = VERGUNNINGEN.content ?? [];

  const listItems: Vergunning[] = items
    .filter((item: Vergunning): item is Vergunning => {
      return item.processed === true;
    })
    .map((item) => {
      return {
        ...item,
        dateRequest: defaultDateFormat(item.dateRequest),
      };
    });

  return (
    <PageTablePaginated
      items={listItems}
      listTitle="Alle eerdere aanvragen"
      title="Vergunningen"
      appRoute={AppRoutes.VERGUNNINGEN_EERDER}
      appRouteBack={AppRoutes.VERGUNNINGEN}
      displayProps={DISPLAY_PROPS_HISTORY}
      chapter={Chapters.VERGUNNINGEN}
      titleKey="identifier"
      isLoading={isLoading(VERGUNNINGEN)}
      isError={isError(VERGUNNINGEN)}
    />
  );
}
