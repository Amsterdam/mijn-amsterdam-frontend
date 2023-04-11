import { useParams } from 'react-router-dom';
import { useAppStateGetter } from '../../hooks';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  PageContent,
  PageHeading,
} from '../../components';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';

const BezwarenDetail = () => {
  const { BEZWAREN } = useAppStateGetter();
  const { uuid } = useParams<{ uuid: string }>();

  console.log(
    uuid,
    BEZWAREN.content,
    BEZWAREN.content?.find((b) => b.uuid === uuid)
  );

  const bezwaar = BEZWAREN.content?.find((b) => b.uuid === uuid);

  const noContent = !isLoading(BEZWAREN) && !bezwaar;

  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.BEZWAREN,
          title: ChapterTitles.BEZWAREN,
        }}
        isLoading={isLoading(BEZWAREN)}
      >
        {bezwaar?.omschrijving || 'Bezwaar'}
      </PageHeading>

      <PageContent>
        {isError(BEZWAREN) || noContent ? (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        ) : (
          <>
            <InfoDetail
              label="Nummer van uw bezwaar"
              value={bezwaar?.bezwaarnummer}
            />
            <InfoDetail label="Onderwerp" value={bezwaar?.omschrijving} />
            <InfoDetail label="Ontvangen op" value={bezwaar?.ontvangstdatum} />
            <InfoDetail label="Specificatie" value={bezwaar?.toelichting} />

            {/* Besluit waartegen u bezwaar maakt, datum */}
            <InfoDetailGroup>
              <InfoDetail
                label="Besluit waartegen u bezwaar maakt"
                value={bezwaar?.primairbesluit}
              />
              <InfoDetail label="Datum" value={bezwaar?.primairbesluitdatum} />
            </InfoDetailGroup>

            {!!bezwaar?.einddatum && (
              <InfoDetail
                label="Resultaat bezwaar"
                value={bezwaar?.resultaat}
              />
            )}
          </>
        )}
      </PageContent>
    </DetailPage>
  );
};

export default BezwarenDetail;
