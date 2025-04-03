import { linkListItems, routes, tableConfig } from './Parkeren-thema-config';
import { isError, isLoading } from '../../../universal/helpers/api';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

export function useParkerenData() {
  const { PARKEREN } = useAppStateGetter();
  const vergunningen = PARKEREN.content?.vergunningen ?? [];
  const hasMijnParkerenVergunningen = !!PARKEREN.content?.isKnown;

  return {
    title: ThemaTitles.PARKEREN,
    tableConfig,
    vergunningen,
    hasMijnParkerenVergunningen,
    isLoading: isLoading(PARKEREN),
    isError: isError(PARKEREN),
    parkerenUrlSSO: PARKEREN.content?.url ?? '/',
    isLoadingParkerenUrl: isLoading(PARKEREN),
    linkListItems,
    routes,
  };
}
