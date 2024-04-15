import { useParams } from 'react-router-dom';
import {
  useAppStateBagApi,
  useAppStateGetter,
  usePhoneScreen,
} from '../../hooks';
import {
  defaultDateFormat,
  isError,
  isLoading,
  uniqueArray,
} from '../../../universal/helpers';
import {
  ErrorAlert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import {
  AppRoutes,
  BagChapters,
  ChapterTitles,
} from '../../../universal/config';
import {
  InfoDetailGroup,
  InfoDetailHeading,
} from '../../components/InfoDetail/InfoDetail';
import BezwarenStatusLines from './BezwarenStatusLines';
import DocumentList from '../../components/DocumentList/DocumentList';
import styles from './BezwarenDetail.module.scss';
import { TextClamp } from '../../components/InfoDetail/TextClamp';
import { BFFApiUrls } from '../../config/api';
import { BezwaarDetail } from '../../../server/services/bezwaren/bezwaren';
import { BarConfig } from '../../components/LoadingContent/LoadingContent';
import { Heading } from '@amsterdam/design-system-react';

const loadingContentBarConfig2: BarConfig = [
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
  ['30rem', '4rem', '2rem'],
];

const BezwarenDetail = () => {
  const { BEZWAREN } = useAppStateGetter();
  const { uuid } = useParams<{ uuid: string }>();

  const bezwaar = BEZWAREN.content?.find((b) => b.uuid === uuid) ?? null;

  const [bezwaarDetail, api] = useAppStateBagApi<BezwaarDetail | null>({
    url: `${BFFApiUrls.BEZWAREN_DETAIL}/${uuid}`,
    bagChapter: BagChapters.BEZWAREN,
    key: uuid,
  });

  const noContent = !isLoading(BEZWAREN) && !bezwaar;
  const documents = bezwaarDetail?.documents ?? [];
  const statussen = bezwaarDetail?.statussen ?? [];
  const documentCategories = uniqueArray(
    documents.map((d) => d.dossiertype).filter(Boolean)
  ).sort();

  const isSmallScreen = usePhoneScreen();

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
        {bezwaar?.identificatie ?? 'Bezwaar'}
      </PageHeading>

      <PageContent>
        {(isError(BEZWAREN) || noContent || api.isError) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}
        {!!bezwaar && (
          <>
            {bezwaar.omschrijving && (
              <InfoDetail label="Onderwerp" value={bezwaar.omschrijving} />
            )}
            {bezwaar.toelichting && (
              <InfoDetail
                label="Reden bezwaar"
                value={
                  <TextClamp tagName="span" minHeight="100px" maxHeight="200px">
                    {bezwaar.toelichting}
                  </TextClamp>
                }
              />
            )}
            {bezwaar.primairbesluit && bezwaar.primairbesluitdatum && (
              <InfoDetailGroup>
                <InfoDetail
                  label="Besluit waartegen u bezwaar maakt"
                  value={bezwaar.primairbesluit}
                />
                <InfoDetail
                  label="Datum"
                  value={defaultDateFormat(bezwaar.primairbesluitdatum)}
                />
              </InfoDetailGroup>
            )}
            {bezwaar.einddatum && bezwaar.resultaat && (
              <InfoDetail label="Resultaat bezwaar" value={bezwaar.resultaat} />
            )}
            {documentCategories.length > 0 && (
              <>
                {documentCategories.map((category) => {
                  const docs = documents.filter(
                    (d) => d.dossiertype === category
                  );
                  return (
                    <InfoDetailGroup
                      key={category}
                      label={
                        <div className={styles.DocumentListHeader}>
                          <InfoDetailHeading
                            label={`Document${
                              documents.length > 1 ? 'en' : ''
                            } ${category.toLowerCase()}`}
                          />
                          {!isSmallScreen && (
                            <span className={styles.DocumentListHeader_Date}>
                              Datum
                            </span>
                          )}
                        </div>
                      }
                    >
                      <DocumentList documents={docs} showDatePublished />
                    </InfoDetailGroup>
                  );
                })}
              </>
            )}
          </>
        )}
      </PageContent>
      {api.isLoading && (
        <PageContent>
          <Heading level={4} size="level-4">
            Status
          </Heading>
          <LoadingContent barConfig={loadingContentBarConfig2} />
        </PageContent>
      )}
      {!!bezwaarDetail && !!bezwaar?.uuid && (
        <BezwarenStatusLines id={bezwaar.uuid} statussen={statussen} />
      )}
    </DetailPage>
  );
};

export default BezwarenDetail;
