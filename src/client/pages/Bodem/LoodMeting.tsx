import { generatePath, useParams } from 'react-router-dom';
import { useAppStateGetter } from '../../hooks';
import { isError, isLoading } from '../../../universal/helpers';
import {
  ErrorAlert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import LoodStatusLines from './LoodStatusLines';
import { Location } from '../VergunningDetail/Location';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';

export default function LoodMeting() {
  const { BODEM } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const meting = BODEM.content?.metingen?.find(
    (meting) => meting.kenmerk === id
  );

  const noContent = !isLoading(BODEM) && !meting;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: generatePath(AppRoutes.BODEM),
          title: ChapterTitles.BODEM,
        }}
        isLoading={isLoading(BODEM)}
      >
        Lood in bodem-check
      </PageHeading>

      <PageContent>
        {(isError(BODEM) || noContent) && (
          <ErrorAlert>
            We kunnen op dit moment geen gegevens tonen.
          </ErrorAlert>
        )}
        {isLoading(BODEM) && <LoadingContent />}
        {!!meting && (
          <>
            <InfoDetail label="Kenmerk" value={meting.aanvraagNummer || '-'} />
            <Location location={meting.adres} />

            {!!meting.document && (
              <InfoDetail
                valueWrapperElement="div"
                label="Document"
                value={
                  <DocumentLink
                    document={meting.document}
                    label={meting.document.title}
                    trackPath={() =>
                      `loodmeting/document/${meting.document?.title}`
                    }
                  ></DocumentLink>
                }
              />
            )}

            {meting.redenAfwijzing && (
              <InfoDetail
                label="Reden afwijzing"
                value={meting.redenAfwijzing}
              />
            )}
          </>
        )}
      </PageContent>
      {meting && <LoodStatusLines request={meting} />}
    </DetailPage>
  );
}
