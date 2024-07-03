import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppStateGetter, useAppStateReady } from '../../hooks';
import styles from './ZaakStatus.module.scss';
import {
  ErrorAlert,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { AppRoutes } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { Paragraph } from '@amsterdam/design-system-react';

const ITEM_NOT_FOUND = 'not-found';
const STATE_ERROR = 'state-error';

type ThemaQueryParam = 'vergunningen';

type PageRouteResolver = {
  baseRoute: string;
  getRoute: (detailPageItemId, appState) => string;
};

type PageRouteResolvers = {
  [key: ThemaQueryParam]: PageRouteResolver;
};

const pageRouteResolvers: PageRouteResolvers = {
  vergunningen: {
    baseRoute: AppRoutes.VERGUNNINGEN,
    getRoute: (detailPageItemId, appState) => {
      if (!isLoading(appState.VERGUNNINGEN)) {
        if (isError(appState.VERGUNNINGEN)) {
          return STATE_ERROR;
        }
        return appState.VERGUNNINGEN.content?.length
          ? appState.VERGUNNINGEN.content?.find(
              (vergunning) => vergunning.identifier === detailPageItemId
            )?.link.to
          : ITEM_NOT_FOUND;
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
  let redirectRoute = AppRoutes.HOME;
  let redirectName = 'Ga naar het dashboard';

  if (pageRoute.unResolvedState === ITEM_NOT_FOUND || appStateReady) {
    if (pageRoute.baseRoute) {
      redirectRoute = pageRoute.baseRoute;
      redirectName = 'Bekijk het overzicht';
    }
  }

  return (
    <TextPage>
      <PageHeading>Status van uw aanvraag</PageHeading>
      <PageContent>
        {true && (
          <LoadingContent
            className={styles.LoadingContent}
            barConfig={[
              ['auto', '2rem', '1rem'],
              ['auto', '2rem', '0'],
            ]}
          />
        )}
        {pageRoute.unResolvedState === ITEM_NOT_FOUND ||
          (appStateReady && queryParams.get('payment') && (
            <Paragraph>
              U heeft betaald voor deze aanvraag. Het kan even duren voordat uw
              aanvraag op Mijn Amsterdam te zien is.
            </Paragraph>
          ))}
        {appStateReady && (
          <Paragraph>
            Wij kunnen de status van uw aanvraag nu niet laten zien.
          </Paragraph>
        )}
        {pageRoute.unResolvedState === STATE_ERROR && (
          <ErrorAlert>
            Wij kunnen nu niet alle gegevens tonen, probeer het later nog eens.
          </ErrorAlert>
        )}
        <Paragraph>
          <MaRouterLink to={redirectRoute}>{redirectName}</MaRouterLink>
        </Paragraph>
      </PageContent>
    </TextPage>
  );
}
