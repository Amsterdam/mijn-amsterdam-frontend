import { AppRoutes } from '../../../universal/config/routes';
import { ThemaTitles, Themas } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ListPagePaginated } from '../../components/ListPagePaginated/ListPagePaginated';

import { VergunningV2 } from '../../../server/services/vergunningen-v2/config-and-types';
import { addLinkElementToProperty } from '../../components/Table/Table';
import { useAppStateGetter } from '../../hooks';
import {
  displayPropsEerdereVergunningen,
  displayPropsHuidigeVergunningen,
} from './config';

export function EerdereVergunningen() {
  const appState = useAppStateGetter();
  const { VERGUNNINGEN_V2 } = appState;
  const vergunningen: VergunningV2[] =
    VERGUNNINGEN_V2.content?.filter((vergunninge) => vergunninge.processed) ??
    [];
  const regelingen = addLinkElementToProperty<VergunningV2>(
    vergunningen,
    'title'
  );
  const appRouteBack = AppRoutes['VERGUNNINGEN_V2'];
  return (
    <ListPagePaginated
      items={regelingen}
      backLinkTitle={ThemaTitles.VERGUNNINGEN}
      title="Eerdere en niet verleende vergunningen en ontheffingen"
      appRoute={AppRoutes['VERGUNNINGEN_V2/EERDERE_VERGUNNINGEN']}
      appRouteBack={appRouteBack}
      displayProps={displayPropsEerdereVergunningen}
      thema={Themas.VERGUNNINGEN_V2}
      isLoading={isLoading(VERGUNNINGEN_V2)}
      isError={isError(VERGUNNINGEN_V2)}
    />
  );
}

export function HuidigeVergunningen() {
  const appState = useAppStateGetter();
  const { VERGUNNINGEN_V2 } = appState;
  const vergunningen: VergunningV2[] =
    VERGUNNINGEN_V2.content?.filter((vergunninge) => !vergunninge.processed) ??
    [];
  const regelingen = addLinkElementToProperty<VergunningV2>(
    vergunningen,
    'title'
  );
  const appRouteBack = AppRoutes['VERGUNNINGEN_V2'];
  return (
    <ListPagePaginated
      items={regelingen}
      backLinkTitle={ThemaTitles.VERGUNNINGEN}
      title="Huidige vergunningen en ontheffingen"
      appRoute={AppRoutes['VERGUNNINGEN_V2/HUIDIGE_VERGUNNINGEN']}
      appRouteBack={appRouteBack}
      displayProps={displayPropsHuidigeVergunningen}
      thema={Themas.VERGUNNINGEN_V2}
      isLoading={isLoading(VERGUNNINGEN_V2)}
      isError={isError(VERGUNNINGEN_V2)}
    />
  );
}
