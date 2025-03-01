import { ReactElement, useEffect, useMemo } from 'react';

import {
  Alert as DSAlert,
  Grid,
  LinkList,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import styles from './StatusDetail.module.scss';
import { AppRoutes, RouteKey } from '../../../universal/config/routes';
import { Thema } from '../../../universal/config/thema';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  AppState,
  AppStateKey,
  GenericDocument,
  StatusLine,
} from '../../../universal/types/App.types';
import {
  DetailPage,
  ErrorAlert,
  LoadingContent,
  PageHeading,
  StatusLine as StatusLineComponent,
  ThemaIcon,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { captureMessage } from '../../helpers/monitoring';

export type StatusSourceItem = StatusLine;

interface StatusDetailProps<T> {
  backLinkTitle?: string;
  backLinkRoute?: string;
  documentPathForTracking?: (document: GenericDocument) => string;
  getItems?: (content: AppState[AppStateKey]['content']) => T[];
  pageContent?:
    | ReactElement
    | ((isLoading: boolean, statusItem: T) => ReactElement);
  reverseSteps?: boolean;
  showStatusLineConnection?: boolean;
  stateKey: AppStateKey;
  statusLabel?: string | 'Status' | ((statusItem: T) => string);
  thema: Thema;
}

export default function StatusDetail<T extends StatusLine>({
  backLinkTitle,
  backLinkRoute,
  documentPathForTracking,
  getItems,
  pageContent,
  reverseSteps = false,
  showStatusLineConnection = true,
  stateKey,
  statusLabel = 'Status',
  thema,
}: StatusDetailProps<T>) {
  const appState = useAppStateGetter();
  const STATE = appState[stateKey];
  const isStateLoading = isLoading(STATE);
  const statusItems = useMemo(
    () =>
      getItems
        ? getItems(STATE.content)
        : Array.isArray(STATE.content)
          ? STATE.content
          : [],
    [STATE.content, getItems]
  ) as T[];

  const { id } = useParams<{ id: string }>();
  const statusItem = statusItems.find((item) => item.id === id) as T;
  const noContent = !isStateLoading && !statusItem;
  const appRoute = backLinkRoute ?? AppRoutes[thema as RouteKey] ?? '/';

  useEffect(() => {
    if (!isStateLoading && !statusItem) {
      captureMessage(`${stateKey} Item not found`, {
        properties: {
          requestedId: id,
          availableIds: statusItems.map((item) => item.id),
        },
      });
    }
  }, [isStateLoading, statusItem, statusItems, stateKey, id]);

  let title = 'Detailpagina';

  if (statusItem) {
    title = statusItem.title;
  }

  let statusItemSteps = statusItem?.steps ?? [];

  if (reverseSteps && statusItemSteps.length) {
    statusItemSteps = [...statusItemSteps];
    statusItemSteps.reverse();
  }

  return (
    <DetailPage className={styles.StatusDetail}>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          to: appRoute,
          title: backLinkTitle ?? ThemaTitles[thema],
        }}
        isLoading={isStateLoading}
      >
        {title}
      </PageHeading>
      <Screen className={styles.DetailPageContent}>
        <Grid>
          {!!statusItem && typeof pageContent === 'function'
            ? (pageContent as Function)(isStateLoading, statusItem)
            : pageContent}

          {(isError(STATE) || (noContent && !statusItems.length)) && (
            <Grid.Cell span="all">
              <ErrorAlert>
                We kunnen op dit moment geen gegevens tonen.{' '}
                <LinkdInline href={appRoute}>Ga naar het overzicht</LinkdInline>
                .
              </ErrorAlert>
            </Grid.Cell>
          )}

          {!isStateLoading && !statusItem && !!statusItems.length && (
            <Grid.Cell span="all">
              <DSAlert title="Deze pagina is mogelijk verplaatst">
                <Paragraph className={styles.MarginBottom}>
                  Kies hieronder een van de beschikbare zaken.
                </Paragraph>
                <LinkList>
                  {statusItems.map((statusItem, index) => {
                    return (
                      <LinkList.Link
                        key={statusItem.link?.to || index}
                        href={statusItem.link?.to || appRoute}
                      >
                        {statusItem.title}
                      </LinkList.Link>
                    );
                  })}
                </LinkList>
              </DSAlert>
            </Grid.Cell>
          )}

          {isStateLoading && (
            <Grid.Cell span="all">
              <LoadingContent />
            </Grid.Cell>
          )}
        </Grid>
      </Screen>
      <Grid>
        {!!(statusItem?.steps && statusItemSteps.length) && (
          <Grid.Cell span="all">
            <StatusLineComponent
              trackCategory={`${thema} / ${statusItem?.about} status`}
              statusLabel={
                typeof statusLabel === 'function'
                  ? statusLabel(statusItem)
                  : statusLabel
              }
              showStatusLineConnection={showStatusLineConnection}
              items={statusItemSteps}
              id={`${thema}-${stateKey}-status`}
              documentPathForTracking={documentPathForTracking}
            />
          </Grid.Cell>
        )}
      </Grid>
    </DetailPage>
  );
}
