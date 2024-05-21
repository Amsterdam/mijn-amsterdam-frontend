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
  ThemaIcon,
  DetailPage,
  InfoDetail,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import { AppRoutes, BagThemas, ThemaTitles } from '../../../universal/config';
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

interface BezwarenDetailPartialProps {
  uuidEncrypted: string;
}

function BezwarenDetailPartial({ uuidEncrypted }: BezwarenDetailPartialProps) {
  const [bezwaarDetail, api] = useAppStateBagApi<BezwaarDetail | null>({
    url: `${BFFApiUrls.BEZWAREN_DETAIL}/${uuidEncrypted}`,
    bagThema: BagThemas.BEZWAREN,
    key: uuidEncrypted,
  });

  const documents = bezwaarDetail?.documents ?? [];
  const statussen = bezwaarDetail?.statussen ?? [];

  const documentCategories = uniqueArray(
    documents.map((d) => d.dossiertype).filter(Boolean)
  ).sort();

  const isSmallScreen = usePhoneScreen();

  return (
    <>
      <PageContent>
        {documentCategories.length > 0 && (
          <>
            {documentCategories.map((category) => {
              const docs = documents.filter((d) => d.dossiertype === category);
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
        {api.isLoading && (
          <>
            <Heading level={4} size="level-4">
              Status
            </Heading>
            <LoadingContent barConfig={loadingContentBarConfig2} />
          </>
        )}
      </PageContent>
      {!!bezwaarDetail && (
        <BezwarenStatusLines id={uuidEncrypted} statussen={statussen} />
      )}
    </>
  );
}

function BezwarenDetail() {
  const { BEZWAREN } = useAppStateGetter();
  const { uuid } = useParams<{ uuid: string }>();

  const bezwaar = BEZWAREN.content?.find((b) => b.uuid === uuid) ?? null;
  const noContent = !isLoading(BEZWAREN) && !bezwaar;

  return (
    <DetailPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          to: AppRoutes.BEZWAREN,
          title: ThemaTitles.BEZWAREN,
        }}
        isLoading={isLoading(BEZWAREN)}
      >
        {bezwaar?.identificatie ?? 'Bezwaar'}
      </PageHeading>

      <PageContent>
        {(isError(BEZWAREN) || noContent) && (
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
              <InfoDetailGroup>
                <InfoDetail
                  label="Resultaat bezwaar"
                  value={bezwaar.resultaat}
                />
                {!!bezwaar.datumResultaat && (
                  <InfoDetail
                    label="Datum"
                    value={defaultDateFormat(bezwaar.datumResultaat)}
                  />
                )}
              </InfoDetailGroup>
            )}
          </>
        )}
      </PageContent>
      {!!bezwaar?.uuidEncrypted && (
        <BezwarenDetailPartial uuidEncrypted={bezwaar.uuidEncrypted} />
      )}
    </DetailPage>
  );
}

export default BezwarenDetail;
