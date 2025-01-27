import { useEffect, useState } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { useHistory } from 'react-router-dom';

import styles from './ZaakStatus.module.scss';
import { AppRoute, AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { AppState } from '../../../universal/types/App.types';
import { ErrorAlert } from '../../components';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter, useAppStateReady } from '../../hooks/useAppState';

const ITEM_NOT_FOUND = 'not-found';
const STATE_ERROR = 'state-error';

type ThemaQueryParam = 'vergunningen' | 'toeristischeVerhuur';

type PageRouteResolver = {
  baseRoute: AppRoute;
  getRoute: (
    detailPageItemId: string,
    appState: AppState
  ) => string | undefined;
};

type PageRouteResolvers = Record<ThemaQueryParam, PageRouteResolver>;

const pageRouteResolvers: PageRouteResolvers = {
  vergunningen: {
    baseRoute: AppRoutes.VERGUNNINGEN,
    getRoute: (detailPageItemId, appState) => {
      if (isError(appState.VERGUNNINGEN)) {
        return STATE_ERROR;
      }
      if (!isLoading(appState.VERGUNNINGEN)) {
        return (
          (appState.VERGUNNINGEN.content || []).find(
            (vergunning) => vergunning.identifier === detailPageItemId
          )?.link.to ?? ITEM_NOT_FOUND
        );
      }
    },
  },
  toeristischeVerhuur: {
    baseRoute: AppRoutes.TOERISTISCHE_VERHUUR,
    getRoute: (detailPageItemId, appState) => {
      if (isError(appState.TOERISTISCHE_VERHUUR)) {
        return STATE_ERROR;
      }

      if (!isLoading(appState.TOERISTISCHE_VERHUUR)) {
        return (
          (
            appState.TOERISTISCHE_VERHUUR.content
              ?.vakantieverhuurVergunningen || []
          ).find((toeristischeVerhuur) => {
            if (toeristischeVerhuur.zaaknummer === detailPageItemId) {
              return toeristischeVerhuur;
            }
          })?.link.to ?? ITEM_NOT_FOUND
        );
      }
    },
  },
};

function useNavigateToPage(queryParams: URLSearchParams) {
  const history = useHistory();
  const appState = useAppStateGetter();
  const thema = queryParams.get('thema') as ThemaQueryParam;
  const id = queryParams.get('id');
  const pageRouteResolver = pageRouteResolvers[thema];
  const getRoute = thema ? pageRouteResolver?.getRoute : false;
  const [unResolvedState, setUnresolvedState] = useState<
    typeof STATE_ERROR | typeof ITEM_NOT_FOUND | undefined
  >(undefined);

  useEffect(() => {
    if (getRoute && id) {
      const route = typeof getRoute === 'function' && getRoute(id, appState);
      if (route === ITEM_NOT_FOUND || route === STATE_ERROR) {
        setUnresolvedState(route);
      } else if (route) {
        // Will unmount component, no further action needed
        history.push(route);
      }
    }
  }, [appState, id, getRoute]);

  return {
    unResolvedState,
    baseRoute: pageRouteResolver?.baseRoute,
  };
}

export default function ZaakStatus() {
  const appStateReady = useAppStateReady();
  const history = useHistory();
  const queryParams = new URLSearchParams(history.location.search);
  const pageRoute = useNavigateToPage(queryParams);

  let linkRoute: AppRoute = AppRoutes.HOME;
  let linkText = 'Ga naar het dashboard';

  // Only needed if zaak with the is ID not found.
  if (pageRoute.baseRoute && pageRoute.unResolvedState !== STATE_ERROR) {
    linkRoute = pageRoute.baseRoute;
    // Item not found but no state error, provide link to the themapagina.
    if (pageRoute.unResolvedState === ITEM_NOT_FOUND) {
      linkText = 'Bekijk het overzicht';
    }
  }

  return (
    <TextPageV2>
      <PageContentV2>
        <PageHeadingV2>Status van uw aanvraag</PageHeadingV2>
        <PageContentCell>
          {/* If we have a state error, show only the error, no links to overview because that has a state error as well. */}
          {pageRoute.unResolvedState === STATE_ERROR && (
            <ErrorAlert className="ams-mb--xs">
              Wij kunnen nu niet alle gegevens tonen, probeer het later nog
              eens.
            </ErrorAlert>
          )}
          {pageRoute.unResolvedState === ITEM_NOT_FOUND && (
            <>
              <Paragraph className="ams-mb--xs">
                Wij kunnen de status van uw aanvraag niet laten zien.
              </Paragraph>
              {queryParams.get('payment') && (
                <Paragraph className="ams-mb--xs">
                  U heeft betaald voor deze aanvraag. Het kan even duren voordat
                  uw aanvraag op Mijn Amsterdam te zien is.
                </Paragraph>
              )}
            </>
          )}
          {/* As soon as we have a result (unResolvedState has a value) or if all state is loaded, show an alternative link. */}
          {(appStateReady || pageRoute.unResolvedState) && (
            <Paragraph>
              <MaRouterLink href={linkRoute}>{linkText}</MaRouterLink>
            </Paragraph>
          )}
          {/* Show the loader if we don't have result yet or when we are still loading. */}
          {!appStateReady && !pageRoute.unResolvedState && (
            <LoadingContent
              className={styles.LoadingContent}
              barConfig={[
                ['auto', '2rem', '1rem'],
                ['auto', '2rem', '0'],
              ]}
            />
          )}
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
