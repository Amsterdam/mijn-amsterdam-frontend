import * as Sentry from '@sentry/react';
import { ReactNode, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, Chapter, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import {
  GenericDocument,
  StatusLine,
} from '../../../universal/types/App.types';
import { AppState } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  Linkd,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine as StatusLineComponent,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { relayApiUrl } from '../../config/api';
import { useAppStateGetter } from '../../hooks/useAppState';
import styles from './StatusDetail.module.scss';

export type StatusSourceItem = StatusLine;

interface StatusDetailProps {
  chapter: Chapter;
  stateKey: keyof AppState;
  getItems?: (
    content: AppState[keyof AppState]['content']
  ) => StatusSourceItem[];
  pageContent?: (isLoading: boolean, statusItem: StatusSourceItem) => ReactNode;
  maxStepCount?: (hasDecision: boolean) => number | undefined;
  showToggleMore?: boolean;
  statusLabel?: string | 'Status' | ((statusItem: StatusSourceItem) => string);
  showStatusLineConnection?: boolean;
  reverseSteps?: boolean;
  highlightKey?: string | false;
  documentPathForTracking?: (document: GenericDocument) => string;
}

export default function StatusDetail({
  stateKey,
  getItems,
  pageContent,
  maxStepCount,
  showToggleMore = true,
  chapter,
  statusLabel = 'Status',
  showStatusLineConnection = true,
  reverseSteps = false,
  highlightKey,
  documentPathForTracking,
}: StatusDetailProps) {
  const appState = useAppStateGetter();
  const STATE = appState[stateKey];
  const isStateLoading = isLoading(STATE);
  const statusItems: StatusSourceItem[] = useMemo(
    () => (getItems ? getItems(STATE.content) : STATE.content || []),
    [STATE.content, getItems]
  );

  const { id } = useParams<{ id: string }>();
  const statusItem = statusItems.find((item) => item.id === id);
  const noContent = !isStateLoading && !statusItem;
  const appRoute = AppRoutes[chapter];
  const hasDecision =
    !!statusItem?.decision ||
    !!statusItem?.steps.some((step) => !!step.decision);

  useEffect(() => {
    if (!isStateLoading && !statusItem) {
      Sentry.captureMessage(`${stateKey} Item not found`, {
        extra: {
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

  statusItemSteps =
    statusItem?.steps.map((step) => {
      return Object.assign({}, step, {
        documents: step.documents.map((document) => {
          return Object.assign({}, document, {
            url: relayApiUrl(document.url),
          });
        }),
      });
    }) || [];

  return (
    <DetailPage className={styles.StatusDetail}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: appRoute, title: ChapterTitles[chapter] }}
        isLoading={isStateLoading}
      >
        {title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {!!statusItem && pageContent && pageContent(isStateLoading, statusItem)}

        {isError(STATE) ||
          (noContent && !statusItems.length && (
            <Alert type="warning">
              <p>
                We kunnen op dit moment geen gegevens tonen.{' '}
                <LinkdInline href={appRoute}>Ga naar het overzicht</LinkdInline>
                .
              </p>
            </Alert>
          ))}

        {!isStateLoading && !statusItem && !!statusItems.length && (
          <Alert type="warning">
            <p>
              Deze pagina is mogelijk verplaatst. Kies hieronder een van de
              beschikbare aanvragen.
            </p>
            <ul className={styles.ItemAlternatives}>
              {statusItems.map((statusItem, index) => {
                return (
                  <li key={statusItem.link?.to || index}>
                    <Linkd href={statusItem.link?.to || appRoute}>
                      {statusItem.title}
                    </Linkd>
                  </li>
                );
              })}
            </ul>
          </Alert>
        )}

        {isStateLoading && <LoadingContent />}
      </PageContent>
      {!!(statusItem?.steps && statusItemSteps.length) && (
        <StatusLineComponent
          trackCategory={`${chapter} / ${statusItem?.about} status`}
          statusLabel={
            typeof statusLabel === 'function'
              ? statusLabel(statusItem)
              : statusLabel
          }
          showStatusLineConnection={showStatusLineConnection}
          items={statusItemSteps}
          showToggleMore={showToggleMore}
          maxStepCount={maxStepCount ? maxStepCount(hasDecision) : undefined}
          highlightKey={highlightKey}
          id={`${chapter}-${stateKey}-status`}
          documentPathForTracking={documentPathForTracking}
        />
      )}
    </DetailPage>
  );
}
