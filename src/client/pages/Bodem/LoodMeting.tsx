import { generatePath, useParams } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  DetailPage,
  ErrorAlert,
  InfoDetail,
  LoadingContent,
  PageContent,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { DocumentLink } from '../../components/DocumentList/DocumentLink';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';
import { Location } from '../VergunningDetail/Location';
import LoodStatusLines from './LoodStatusLines';

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
        icon={<ThemaIcon />}
        backLink={{
          to: generatePath(AppRoutes.BODEM),
          title: ThemaTitles.BODEM,
        }}
        isLoading={isLoading(BODEM)}
      >
        Lood in bodem-check
      </PageHeading>

      <PageContent>
        {(isError(BODEM) || noContent) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
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
