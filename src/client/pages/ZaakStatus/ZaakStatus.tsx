import { useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAppStateGetter, useAppStateReady } from '../../hooks';
import {
  LinkdInline,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { AppRoutes, DocumentTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';

const ITEM_NOT_FOUND = 'not-found';
const STATE_ERROR = 'not-found';

type ThemaQueryParam = 'vergunningen';
const pageRouteResolvers: {
  vergunningen: {
    baseRoute: string;
    getRoute: (detailPageItemId, appState) => string;
  };
} = {
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

function useNavigateToPage(queryParams) {
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
  let pageHeadingText = 'Er is een fout opgetreden';
  let pageContentText = 'Ga naar ';
  let redirectRoute = AppRoutes.HOME;
  let redirectName = 'home';

  if (pageRoute.unResolvedState === ITEM_NOT_FOUND || appStateReady) {
    if (pageRoute.baseRoute) {
      redirectRoute = pageRoute.baseRoute;
      redirectName = DocumentTitles[pageRoute.baseRoute] as string;
    }
    if (queryParams.get('payment')) {
      pageHeadingText = 'Wachten op betaling';
      pageContentText = 'Momenteel wordt er gewacht op de betaling.';
    }
  } else if (pageRoute.unResolvedState === STATE_ERROR) {
    pageHeadingText = 'Er is een error';
    pageContentText = 'Er is een error opgetreden, probeer het later nog eens.';
  }
  return (
    <div>
      <TextPage>
        {!appStateReady ? (
          <>
            {' '}
            <PageContent>
              <p>
                <LoadingContent
                  barConfig={[
                    ['auto', '2rem', '1rem'],
                    ['auto', '2rem', '0'],
                  ]}
                />
              </p>
            </PageContent>
          </>
        ) : (
          <>
            <PageHeading>{pageHeadingText}</PageHeading>
            <PageContent id="skip-to-id-AppContent">
              {pageContentText}
              <LinkdInline href={redirectRoute}>{redirectName}</LinkdInline>
            </PageContent>
          </>
        )}
      </TextPage>
    </div>
  );
}
