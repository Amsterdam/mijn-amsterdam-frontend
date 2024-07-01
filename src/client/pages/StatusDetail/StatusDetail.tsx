import { ReactNode, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, Thema, ThemaTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';

import {
  Alert as DSAlert,
  Grid,
  LinkList,
  Paragraph,
  Screen,
} from '@amsterdam/design-system-react';
import {
  GenericDocument,
  StatusLine,
} from '../../../universal/types/App.types';
import { AppState, AppStateKey } from '../../AppState';
import {
  ThemaIcon,
  DetailPage,
  ErrorAlert,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine as StatusLineComponent,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { useAppStateGetter } from '../../hooks/useAppState';
import { captureMessage } from '../../utils/monitoring';
import styles from './StatusDetail.module.scss';

export type StatusSourceItem = StatusLine;
interface StatusDetailProps<T extends StatusLine> {
  backLinkTitle?: string;
  documentPathForTracking?: (document: GenericDocument) => string;
  getItems?: (content: AppState[AppStateKey]['content']) => T[];
  highlightKey?: string | false;
  maxStepCount?: (hasDecision: boolean, statusItem?: T) => number | undefined;
  pageContent?: <T extends StatusLine>(
    isLoading: boolean,
    statusItem: T
  ) => ReactNode;
  reverseSteps?: boolean;
  showStatusLineConnection?: boolean;
  stateKey: AppStateKey;
  statusLabel?: string | 'Status' | ((statusItem: T) => string);
  thema: Thema;
}

export default function StatusDetail<T extends StatusLine>({
  backLinkTitle,
  documentPathForTracking,
  getItems,
  highlightKey,
  maxStepCount,
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
  const statusItem = statusItems.find((item) => item.id === id);
  const noContent = !isStateLoading && !statusItem;
  const appRoute = AppRoutes[thema];
  const hasDecision =
    !!statusItem?.decision ||
    !!statusItem?.steps.some((step) => !!step.decision);

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
        backLink={{ to: appRoute, title: backLinkTitle ?? ThemaTitles[thema] }}
        isLoading={isStateLoading}
      >
        {title}
      </PageHeading>
      <Screen className={styles.DetailPageContent}>
        <Grid>
          {!!statusItem &&
            pageContent &&
            pageContent(isStateLoading, statusItem)}

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
                  Kies hieronder een van de beschikbare aanvragen.
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
              maxStepCount={
                maxStepCount ? maxStepCount(hasDecision, statusItem) : undefined
              }
              highlightKey={highlightKey}
              id={`${thema}-${stateKey}-status`}
              documentPathForTracking={documentPathForTracking}
            />
          </Grid.Cell>
        )}
      </Grid>
    </DetailPage>
  );
}
