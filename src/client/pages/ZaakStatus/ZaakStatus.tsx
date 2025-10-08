import { useEffect, useState } from 'react';

import { Paragraph } from '@amsterdam/design-system-react';
import { useLocation, useNavigate } from 'react-router';

import { ZAAK_STATUS_PAGE_DOCUMENT_TITLE } from './ZaakStatus-routes';
import styles from './ZaakStatus.module.scss';
import { isError, isLoading } from '../../../universal/helpers/api';
import { AppStateBase, LinkProps } from '../../../universal/types/App.types';
import ErrorAlert from '../../components/Alert/Alert';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import {
  useAppStateGetter,
  useAppStateReady,
} from '../../hooks/useAppStateStore';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';
import { DashboardRoute } from '../Dashboard/Dashboard-routes';
import * as AVG from '../Thema/AVG/AVG-thema-config';
import * as BODEM from '../Thema/Bodem/Bodem-thema-config';
import * as HORECA from '../Thema/Horeca/Horeca-thema-config';
import * as KLACHTEN from '../Thema/Klachten/Klachten-thema-config';
import * as PARKEREN from '../Thema/Parkeren/Parkeren-thema-config';
import * as TOERISTISCHE_VERHUUR from '../Thema/ToeristischeVerhuur/ToeristischeVerhuur-thema-config';
import * as VERGUNNINGEN from '../Thema/Vergunningen/Vergunningen-thema-config';

const ITEM_NOT_FOUND = 'not-found';
const STATE_ERROR = 'state-error';
const NOT_ABLE_TO_DETERMINE_ROUTE = undefined;

type ThemaQueryParam =
  | 'vergunningen'
  | 'toeristischeVerhuur'
  | 'horeca'
  | 'parkeren'
  | 'bodem'
  | 'klachten'
  | 'avg';

type PageRouteResolver = {
  baseRoute: string;
  getRoute: (
    detailPageItemId: string,
    appState: AppStateBase
  ) => string | undefined;
};

type PageRouteResolvers = Record<ThemaQueryParam, PageRouteResolver>;

function getZakenFromContentArray<T extends AppStateBase[keyof AppStateBase]>(
  appStateSlice: T
): Array<{ identifier: string; link: LinkProps }> | null {
  return Array.isArray(appStateSlice.content)
    ? appStateSlice.content.filter((zaak) => {
        return 'identifier' in zaak && 'link' in zaak;
      })
    : null;
}

type GetZakenFn<T extends AppStateBase[keyof AppStateBase]> = (
  appStateSlice: T
) => Array<{
  identifier: string;
  link: LinkProps;
}> | null;

/**
 * Generates a route resolver for Zaken that have an identifier and a link,
 * and are provided as an array in the ApiResponse['content'].
 * @param baseRoute - The base route for the resolver.
 * @param appStateKey - The key in the AppState to access the relevant data.
 * @param getZaken - A function to extract Zaken from the app state slice.
 *                   Defaults to getZakenFromContentArray.
 *                   This function should return an array of objects with
 *                   'identifier' and 'link' properties.
 *                   If the app state slice is not an array, it should return null.
 * @returns A PageRouteResolver object.
 */
function baseThemaConfig<K extends keyof AppStateBase>(
  baseRoute: string,
  appStateKey: K,
  getZaken: GetZakenFn<AppStateBase[K]> = getZakenFromContentArray
): PageRouteResolver {
  return {
    baseRoute,
    getRoute(identifier, appState) {
      const stateSlice = appState[appStateKey];

      if (isLoading(stateSlice)) {
        return NOT_ABLE_TO_DETERMINE_ROUTE;
      }

      if (isError(stateSlice)) {
        return STATE_ERROR;
      }

      if (stateSlice.status === 'OK') {
        const zaken = stateSlice !== null ? getZaken(stateSlice) : null;
        if (!Array.isArray(zaken)) {
          return ITEM_NOT_FOUND;
        }

        const zaak = zaken.find((zaak) => zaak.identifier === identifier);
        return zaak?.link?.to ?? ITEM_NOT_FOUND;
      }

      return NOT_ABLE_TO_DETERMINE_ROUTE;
    },
  };
}

const pageRouteResolvers: PageRouteResolvers = {
  vergunningen: baseThemaConfig(
    VERGUNNINGEN.routeConfig.themaPage.path,
    VERGUNNINGEN.themaId
  ),
  horeca: baseThemaConfig(HORECA.routeConfig.themaPage.path, HORECA.themaId),
  parkeren: baseThemaConfig(
    PARKEREN.routeConfig.themaPage.path,
    PARKEREN.themaId,
    (stateSlice) => {
      return stateSlice.content?.vergunningen ?? null;
    }
  ),
  toeristischeVerhuur: baseThemaConfig(
    TOERISTISCHE_VERHUUR.routeConfig.themaPage.path,
    TOERISTISCHE_VERHUUR.themaId,
    (stateSlice) => {
      const { vakantieverhuurVergunningen = [], bbVergunningen = [] } =
        stateSlice.content ?? {};
      return [...vakantieverhuurVergunningen, ...bbVergunningen];
    }
  ),
  bodem: baseThemaConfig(
    BODEM.routeConfig.themaPage.path,
    BODEM.themaId,
    (stateSlice) => {
      return stateSlice.content;
    }
  ),
  avg: baseThemaConfig(
    AVG.routeConfig.themaPage.path,
    AVG.themaId,
    (stateSlice) => {
      return stateSlice.content?.verzoeken ?? null;
    }
  ),
  klachten: baseThemaConfig(
    KLACHTEN.routeConfig.themaPage.path,
    KLACHTEN.themaId,
    (stateSlice) => {
      return stateSlice.content;
    }
  ),
};

function useNavigateToPage(queryParams: URLSearchParams) {
  const navigate = useNavigate();
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
        navigate(route);
      }
    }
  }, [appState, id, getRoute]);

  return {
    unResolvedState,
    baseRoute: pageRouteResolver?.baseRoute,
  };
}

export function ZaakStatus() {
  useHTMLDocumentTitle({ documentTitle: ZAAK_STATUS_PAGE_DOCUMENT_TITLE });

  const appStateReady = useAppStateReady();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const pageRoute = useNavigateToPage(queryParams);

  let linkRoute: PageRouteResolver['baseRoute'] = DashboardRoute.route;
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
            <ErrorAlert className="ams-mb-s">
              Wij kunnen nu niet alle gegevens tonen, probeer het later nog
              eens.
            </ErrorAlert>
          )}
          {pageRoute.unResolvedState === ITEM_NOT_FOUND && (
            <>
              <Paragraph className="ams-mb-s">
                Wij kunnen de status van uw aanvraag niet laten zien.
              </Paragraph>
              {queryParams.get('payment') && (
                <Paragraph className="ams-mb-s">
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

export const forTesting = {
  baseThemaConfig,
  getZakenFromContentArray,
};
