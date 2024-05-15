import { AppRoutes, Themas } from '../../../universal/config';
import {
  defaultDateTimeFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import { addTitleLinkComponent } from '../../components';
import { PageTablePaginated } from '../../components/TablePagePaginated/TablePagePaginated';
import { useAppStateGetter } from '../../hooks';
import { DISPLAY_PROPS } from './Sia';

export default function SiaListClosed() {
  const { SIA } = useAppStateGetter();

  let listItems = SIA.content?.open?.items ?? [];
  listItems = listItems.map((item) => {
    return {
      ...item,
      datePublished: defaultDateTimeFormat(item.datePublished),
    };
  });
  listItems = addTitleLinkComponent(listItems, 'identifier');

  return (
    <PageTablePaginated
      items={listItems}
      listTitle="Alle open meldingen"
      title="Meldingen"
      appRoute={AppRoutes.SIA_OPEN}
      appRouteBack={AppRoutes.ROOT}
      displayProps={DISPLAY_PROPS}
      thema={Themas.SIA}
      titleKey="identifier"
      isLoading={isLoading(SIA)}
      isError={isError(SIA)}
    />
  );
}
