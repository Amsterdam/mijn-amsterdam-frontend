import { generatePath, useParams } from 'react-router-dom';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import {
  DetailPage,
  ErrorAlert,
  InfoDetail,
  PageContent,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks';
import AVGStatusLines from './AVGStatusLines';

const AVGDetail = () => {
  const { AVG } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const verzoek = AVG.content?.verzoeken?.find((verzoek) => verzoek.id === id);

  const noContent = !isLoading(AVG) && !verzoek;

  return (
    <DetailPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          to: generatePath(AppRoutes.AVG, {
            page: 1,
          }),
          title: ThemaTitles.AVG,
        }}
        isLoading={isLoading(AVG)}
      >
        AVG verzoek
      </PageHeading>

      <PageContent>
        {isError(AVG) || noContent ? (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        ) : (
          <>
            <InfoDetail label="Nummer" value={verzoek?.id || '-'} />
            <InfoDetail label="Type verzoek" value={verzoek?.type || '-'} />
            <InfoDetail
              label="Onderwerp(en)"
              value={verzoek?.themas?.join(', ') || '-'}
            />
            <InfoDetail
              label="Toelichting"
              value={verzoek?.toelichting || '-'}
            />
          </>
        )}
      </PageContent>
      {verzoek && <AVGStatusLines request={verzoek} />}
    </DetailPage>
  );
};

export default AVGDetail;
