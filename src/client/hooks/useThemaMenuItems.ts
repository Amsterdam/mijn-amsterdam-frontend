import { useMemo } from 'react';

import { useAppStateGetter } from './useAppState';
import { useProfileTypeValue } from './useProfileType';
import { AppRoutes } from '../../universal/config/routes';
import { Themas } from '../../universal/config/thema';
import { ApiResponse, isError, isLoading } from '../../universal/helpers/api';
import { AppState } from '../../universal/types/App.types';
import { DecosCaseType } from '../../universal/types/vergunningen';
import { themasByProfileType } from '../config/menuItems';
import { ThemaMenuItem } from '../config/thema';
import { getThemaMenuItemsAppState, isThemaActive } from '../config/themas';
import { PARKEER_CASE_TYPES } from '../pages/Parkeren/useParkerenData.hook';

export interface ThemasState {
  items: ThemaMenuItem[];
  isLoading: boolean;
}

export function useThemaMenuItems(): ThemasState {
  const profileType = useProfileTypeValue();
  const appState = useAppStateGetter();
  const themaItems = themasByProfileType(profileType);

  const items = useMemo(() => {
    return themaItems
      .filter((item) => {
        // Check to see if Thema has been loaded or if it is directly available
        return item.isAlwaysVisible || isThemaActive(item, appState);
      })
      .map((item) => {
        if (item.id === Themas.PARKEREN) {
          return handleParkerenItem(item, appState);
        }
        return item;
      });
  }, [themaItems, appState]);

  const themaItemsWithAppState = useMemo(() => {
    return getThemaMenuItemsAppState(appState, themaItems);
  }, [appState, themaItems]);

  const themasState = useMemo(
    () => ({
      items,
      isLoading:
        !!appState &&
        themaItemsWithAppState.some((apiState) => {
          const apiStateTyped = apiState as ApiResponse<unknown>;
          return isLoading(apiStateTyped) && !isError(apiStateTyped);
        }),
    }),
    [items, appState, themaItemsWithAppState]
  );

  return themasState;
}

function handleParkerenItem(
  item: ThemaMenuItem,
  appState: AppState
): ThemaMenuItem {
  const hasParkerenVergunningen = (appState.VERGUNNINGEN?.content ?? []).some(
    (vergunning) => PARKEER_CASE_TYPES.has(vergunning.caseType as DecosCaseType)
  );

  return {
    ...item,
    to: hasParkerenVergunningen
      ? AppRoutes.PARKEREN
      : appState.PARKEREN.content?.url ||
        import.meta.env.REACT_APP_SSO_URL_PARKEREN,
    rel: hasParkerenVergunningen ? undefined : 'external',
  };
}
