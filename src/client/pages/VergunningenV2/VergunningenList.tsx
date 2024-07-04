import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles, Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

import { useParams } from 'react-router-dom';
import { VergunningV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { useAppStateGetter } from '../../hooks';
import {
  ListPageParamKind,
  displayPropsEerdereVergunningen,
  displayPropsHuidigeVergunningen,
  listPageTitle,
} from './config';

export function VergunningenList() {
  const params = useParams<{ kind: ListPageParamKind }>();
  const isListWithHistoricItems =
    params.kind === 'eerdere-vergunningen-en-ontheffingen';
  const appState = useAppStateGetter();
  const { VERGUNNINGENv2 } = appState;
  const vergunningen: VergunningV2[] =
    VERGUNNINGENv2.content?.filter((vergunninge) =>
      params.kind === 'eerdere-vergunningen-en-ontheffingen'
        ? vergunninge.processed
        : !vergunninge.processed
    ) ?? [];
  const huidigeVergunningen = addLinkElementToProperty<VergunningV2>(
    vergunningen,
    'title'
  );
  const displayProps = isListWithHistoricItems
    ? displayPropsEerdereVergunningen
    : displayPropsHuidigeVergunningen;
  const appRouteBack = AppRoutes['VERGUNNINGEN'];
  return (
    <ListPagePaginated
      items={huidigeVergunningen}
      backLinkTitle={ThemaTitles.VERGUNNINGEN}
      title={listPageTitle[params.kind]}
      appRoute={AppRoutes['VERGUNNINGEN/LIST']}
      appRouteBack={appRouteBack}
      displayProps={displayProps}
      thema={Themas.VERGUNNINGENv2}
      isLoading={isLoading(VERGUNNINGENv2)}
      isError={isError(VERGUNNINGENv2)}
    />
  );
}
