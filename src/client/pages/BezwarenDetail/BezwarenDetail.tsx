import { useParams } from 'react-router-dom';
import { useAppStateGetter } from '../../hooks';
import {
  defaultDateFormat,
  isError,
  isLoading,
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
import { InfoDetailGroup } from '../../components/InfoDetail/InfoDetail';
import BezwarenStatusLines from './BezwarenStatusLines';
import { DocumentLink } from '../../components/DocumentList/DocumentList';
import styles from './BezwarenDetail.module.scss';

const BezwarenDetail = () => {
  const { BEZWAREN } = useAppStateGetter();
  const { uuid } = useParams<{ uuid: string }>();

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
        Bezwaar
      </PageHeading>

      <PageContent>
        {isError(BEZWAREN) || noContent ? (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        ) : (
          <>
            <InfoDetail
              label="Kenmerk van uw bezwaar"
              value={bezwaar?.zaakkenmerk}
            />
            {bezwaar?.omschrijving && (
              <InfoDetail label="Onderwerp" value={bezwaar.omschrijving} />
            )}
            {bezwaar?.ontvangstdatum && (
              <InfoDetail
                label="Ontvangen op"
                value={defaultDateFormat(bezwaar.ontvangstdatum)}
              />
            )}
            {bezwaar?.toelichting && (
              <InfoDetail label="Specificatie" value={bezwaar.toelichting} />
            )}

            {bezwaar?.primairbesluit && bezwaar?.primairbesluitdatum && (
              <InfoDetailGroup>
                <InfoDetail
                  label="Besluit waartegen u bezwaar maakt"
                  value={bezwaar.primairbesluit}
                />
                <InfoDetail
                  label="Datum"
                  value={defaultDateFormat(
                    new Date(bezwaar.primairbesluitdatum)
                  )}
                />
              </InfoDetailGroup>
            )}

            {!!bezwaar?.documenten?.length &&
              bezwaar?.documenten?.length > 0 && (
                <InfoDetailGroup>
                  <InfoDetail
                    valueWrapperElement="div"
                    label={`Document${
                      bezwaar.documenten.length > 1 ? 'en' : ''
                    }`}
                    value={
                      <ul className={styles.documentlist}>
                        {bezwaar.documenten.map((document) => (
                          <li key={`document-link-${document.id}`}>
                            <DocumentLink
                              document={document}
                              label={document.titel}
                              trackPath={() =>
                                `bezwaar/document/${document.titel}`
                              }
                            ></DocumentLink>
                          </li>
                        ))}
                      </ul>
                    }
                  />
                  <InfoDetail
                    valueWrapperElement="div"
                    label="Datum"
                    value={
                      <ul className={styles.documentlist}>
                        {bezwaar.documenten.map((document) => (
                          <li key={`document-date-${document.id}`}>
                            {document.datePublished}
                          </li>
                        ))}
                      </ul>
                    }
                  />
                </InfoDetailGroup>
              )}

            {!!bezwaar?.einddatum && bezwaar?.resultaat && (
              <InfoDetail label="Resultaat bezwaar" value={bezwaar.resultaat} />
            )}
          </>
        )}
      </PageContent>
      {!!bezwaar && (
        <BezwarenStatusLines id={bezwaar.uuid} statussen={bezwaar.statussen} />
      )}
    </DetailPage>
  );
};

export default BezwarenDetail;
