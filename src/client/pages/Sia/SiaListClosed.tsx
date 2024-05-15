import { AppRoutes, Themas } from '../../../universal/config';
import {
  defaultDateTimeFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { addTitleLinkComponent } from '../../components';
import { PageTablePaginated } from '../../components/TablePagePaginated/TablePagePaginated';
import { useAppStateGetter } from '../../hooks';
import { DISPLAY_PROPS_HISTORY } from './Sia';

export default function SiaListClosed() {
  const { SIA } = useAppStateGetter();

  let listItems = SIA.content?.afgesloten?.items ?? [];
  listItems = listItems.map((item) => {
    return {
      ...item,
      dateClosed: item.dateClosed
        ? defaultDateTimeFormat(item.dateClosed)
        : null,
    };
  });

  listItems = addTitleLinkComponent(listItems, 'identifier');

  return (
    <PageTablePaginated
      items={listItems}
      listTitle="Alle afgesloten meldingen"
      title="Meldingen"
      appRoute={AppRoutes.SIA_CLOSED}
      appRouteBack={AppRoutes.ROOT}
      displayProps={DISPLAY_PROPS_HISTORY}
      thema={Themas.SIA}
      titleKey="identifier"
      isLoading={isLoading(SIA)}
      isError={isError(SIA)}
    />
  );
}
