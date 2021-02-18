import * as Sentry from '@sentry/browser';
import { ReactNode, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, Chapter, ChapterTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';
import { LinkProps } from '../../../universal/types/App.types';
import { AppState } from '../../AppState';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  Linkd,
  LoadingContent,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { LinkdInline } from '../../components/Button/Button';
import { StatusLineItem } from '../../components/StatusLine/StatusLine';
import { useAppStateGetter } from '../../hooks/useAppState';
import AlertDocumentDownloadsDisabled from '../Inkomen/AlertDocumentDownloadsDisabled';
import styles from './StatusDetail.module.scss';

export interface StatusSourceItem {
  id: string;
  title: string;
  productTitle?: string;
  link: LinkProps;
  steps: StatusLineItem[];
  [key: string]: any;
}

interface StatusDetailProps {
  chapter: Chapter;
  stateKey: keyof AppState;
  pageContent?: (isLoading: boolean, statusItem: StatusSourceItem) => ReactNode;
  maxStepCount?: (hasDecision: boolean) => number | undefined;
  showToggleMore?: boolean;
  statusLabel?: string | 'Status' | ((statusItem: StatusSourceItem) => string);
  highlightKey?: string | false;
}

export default function StatusDetail({
  stateKey,
  pageContent,
  maxStepCount,
  showToggleMore = true,
  chapter,
  statusLabel = 'Status',
  highlightKey,
}: StatusDetailProps) {
  const appState = useAppStateGetter();
  const STATE = appState[stateKey];
  const isStateLoading = isLoading(STATE);
  const statusItems: StatusSourceItem[] = useMemo(() => STATE.content || [], [
    STATE.content,
  ]);

  const { id } = useParams<{ id: string }>();
  const statusItem = statusItems.find((item) => item.id === id);
  const noContent = !isStateLoading && !statusItem;
  const appRoute = AppRoutes[chapter];
  const hasDecision = !!statusItem?.steps.some(
    (step) => step.status === 'Besluit'
  );

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

  let title = 'Tozo';

  if (statusItem) {
    title = statusItem.title;
  }

  return (
    <DetailPage className={styles.StatusDetail}>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: appRoute, title: ChapterTitles[chapter] }}
        isLoading={isStateLoading}
      >
        {statusItem?.productTitle || title}
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
              {statusItems.map((statusItem) => {
                return (
                  <li>
                    <Linkd href={statusItem.link.to}>{statusItem.title}</Linkd>
                  </li>
                );
              })}
            </ul>
          </Alert>
        )}

        <AlertDocumentDownloadsDisabled />

        {isStateLoading && <LoadingContent />}
      </PageContent>

      {!!(statusItem?.steps && statusItem.steps.length) && (
        <StatusLine
          trackCategory={`${chapter} / ${statusItem?.productTitle} status`}
          statusLabel={
            typeof statusLabel === 'function'
              ? statusLabel(statusItem)
              : statusLabel
          }
          items={statusItem.steps}
          showToggleMore={showToggleMore}
          maxStepCount={maxStepCount ? maxStepCount(hasDecision) : undefined}
          highlightKey={highlightKey}
          id={`${chapter}-${stateKey}-status`}
        />
      )}
    </DetailPage>
  );
}
