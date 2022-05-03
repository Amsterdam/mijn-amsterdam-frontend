import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { dateSort, isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import Linkd, { LinkdInline } from '../../components/Button/Button';
import { InboxItem, InboxView } from '../../components/InboxView/InboxView';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks';
import styles from '../StatusDetail/StatusDetail.module.scss';

export default function InkomenDetailBbz() {
  const appState = useAppStateGetter();
  const inboxItems: InboxItem[] = (appState.WPI_BBZ.content || [])
    .flatMap((item) => item.steps)
    .map((step) => {
      return {
        status: step.status,
        datePublished: step.datePublished,
        description: step.description,
        documents: step.documents,
      };
    })
    .sort(dateSort('datePublished', 'desc'));
  const noContent = !inboxItems.length && !isLoading(appState.WPI_BBZ);

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{ to: AppRoutes.INKOMEN, title: ChapterTitles.INKOMEN }}
        isLoading={false}
      >
        Uw Bbz overzicht
      </PageHeading>
      <PageContent className={styles.DetailPageContent}>
        <p>
          Hieronder ziet u de status van uw aanvraag voor een uitkering of
          lening van het Bbz. Ook als u een IOAZ uitkering heeft aangevraagd
          ziet u de status hieronder. Het duurt maximaal 3 werkdagen voordat uw
          documenten over het Bbz in Mijn Amsterdam staan.
        </p>
        <p>
          Hebt u schuldhulp aangevraagd? Dan wordt daarover contact met u
          opgenomen.
        </p>
        <p>
          <Linkd external={true} href={ExternalUrls.WPI_BBZ}>
            Meer informatie over het Bbz
          </Linkd>
        </p>
        {isError(appState.WPI_BBZ) ||
          (noContent && !inboxItems.length && (
            <Alert type="warning">
              <p>
                We kunnen op dit moment geen gegevens tonen.{' '}
                <LinkdInline href={AppRoutes.INKOMEN}>
                  Ga naar het overzicht
                </LinkdInline>
                .
              </p>
            </Alert>
          ))}
        {isLoading(appState.WPI_BBZ) && <LoadingContent />}
      </PageContent>
      <InboxView
        documentPathForTracking={(document) =>
          `/downloads/inkomen/bbz/${document.title.split(/\n/)[0]}`
        }
        items={inboxItems}
      />
    </DetailPage>
  );
}
