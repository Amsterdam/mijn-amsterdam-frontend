import { ReactNode, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { AppRoutes, Thema, ThemaTitles } from '../../../universal/config';
import { isError, isLoading } from '../../../universal/helpers';

import {
  Alert as DSAlert,
  LinkList,
  Paragraph,
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
import { relayApiUrl } from '../../utils/utils';
import styles from './StatusDetail.module.scss';

export type StatusSourceItem = StatusLine;
interface StatusDetailProps {
  thema: Thema;
  stateKey: AppStateKey;
  getItems?: (content: AppState[AppStateKey]['content']) => StatusSourceItem[];
  pageContent?: (isLoading: boolean, statusItem: StatusSourceItem) => ReactNode;
  maxStepCount?: (hasDecision: boolean) => number | undefined;
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
  thema,
  statusLabel = 'Status',
  showStatusLineConnection = true,
  reverseSteps = false,
  highlightKey,
  documentPathForTracking,
}: StatusDetailProps) {
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
  ) as StatusSourceItem[];

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

  statusItemSteps =
    statusItemSteps.map((step) => {
      return Object.assign({}, step, {
        documents: step.documents?.map((document) => {
          return Object.assign({}, document, {
            url: relayApiUrl(document.url),
          });
        }),
      });
    }) || [];

  return (
    <DetailPage className={styles.StatusDetail}>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{ to: appRoute, title: ThemaTitles[thema] }}
        isLoading={isStateLoading}
      >
        {title}
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        {!!statusItem && pageContent && pageContent(isStateLoading, statusItem)}

        {(isError(STATE) || (noContent && !statusItems.length)) && (
          <ErrorAlert>
            We kunnen op dit moment geen gegevens tonen.{' '}
            <LinkdInline href={appRoute}>Ga naar het overzicht</LinkdInline>.
          </ErrorAlert>
        )}

        {!isStateLoading && !statusItem && !!statusItems.length && (
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
        )}

        {isStateLoading && <LoadingContent />}
      </PageContent>
      {!!(statusItem?.steps && statusItemSteps.length) && (
        <StatusLineComponent
          trackCategory={`${thema} / ${statusItem?.about} status`}
          statusLabel={
            typeof statusLabel === 'function'
              ? statusLabel(statusItem)
              : statusLabel
          }
          showStatusLineConnection={showStatusLineConnection}
          items={statusItemSteps}
          maxStepCount={maxStepCount ? maxStepCount(hasDecision) : undefined}
          highlightKey={highlightKey}
          id={`${thema}-${stateKey}-status`}
          documentPathForTracking={documentPathForTracking}
        />
      )}
    </DetailPage>
  );
}
