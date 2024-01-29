import { useParams } from 'react-router-dom';
import { useAppStateGetter, usePhoneScreen } from '../../hooks';
import {
  defaultDateFormat,
  isError,
  isLoading,
  uniqueArray,
} from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  PageContent,
  PageHeading,
} from '../../components';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  InfoDetailGroup,
  InfoDetailHeading,
} from '../../components/InfoDetail/InfoDetail';
import BezwarenStatusLines from './BezwarenStatusLines';
import DocumentList from '../../components/DocumentList/DocumentList';
import styles from './BezwarenDetail.module.scss';
import { TextClamp } from '../../components/InfoDetail/TextClamp';

const BezwarenDetail = () => {
  const { BEZWAREN } = useAppStateGetter();
  const { uuid } = useParams<{ uuid: string }>();

  const bezwaar = BEZWAREN.content?.find((b) => b.uuid === uuid) ?? null;

  const noContent = !isLoading(BEZWAREN) && !bezwaar;

  const documentCategories = uniqueArray(
    !bezwaar ? [] : bezwaar.documenten.map((d) => d.dossiertype).filter(Boolean)
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
        {(isError(BEZWAREN) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
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
                  const docs = bezwaar.documenten.filter(
                    (d) => d.dossiertype === category
                  );
                  return (
                    <InfoDetailGroup
                      key={category}
                      label={
                        <div className={styles.DocumentListHeader}>
                          <InfoDetailHeading
                            label={`Document${
                              bezwaar.documenten.length > 1 ? 'en' : ''
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
      {!!bezwaar?.statussen && !!bezwaar?.uuid && (
        <BezwarenStatusLines id={bezwaar.uuid} statussen={bezwaar.statussen} />
      )}
    </DetailPage>
  );
};

export default BezwarenDetail;
