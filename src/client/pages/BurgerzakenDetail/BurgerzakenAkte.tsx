import { useParams } from 'react-router-dom';
import { AppRoutes, ChapterTitles } from '../../../universal/config';
import {
  capitalizeFirstLetter,
  defaultDateFormat,
  isError,
  isLoading,
} from '../../../universal/helpers';
import {
  Alert,
  ChapterIcon,
  DetailPage,
  InfoDetail,
  LoadingContent,
  PageContent,
  PageHeading,
} from '../../components';
import styles from './BurgerzakenDetail.module.scss';
import { useAppStateGetter } from '../../hooks/useAppState';
import DocumentList from '../../components/DocumentList/DocumentList';

export default function BurgerzakenIDKaart() {
  const { AKTES } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const Akte = AKTES.content?.find((item) => item.id === id);
  const noContent = !isLoading && !Akte;
  console.log(Akte?.documents);
  return (
    <DetailPage>
      <PageHeading
        icon={<ChapterIcon />}
        backLink={{
          to: AppRoutes.BURGERZAKEN,
          title: ChapterTitles.BURGERZAKEN,
        }}
        isLoading={isLoading(AKTES)}
      >
        {capitalizeFirstLetter(Akte?.type || 'Akte')}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(AKTES) || noContent) && (
          <Alert type="warning">
            <p>We kunnen op dit moment geen gegevens tonen.</p>
          </Alert>
        )}
        {isLoading(AKTES) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!!Akte && (
          <>
            <InfoDetail label="Aktenummer" value={Akte.aktenummer} />
            <InfoDetail
              label="Registerjaar"
              value={defaultDateFormat(Akte.registerjaar)}
            />
            <InfoDetail
              el="div"
              label="Download PDF"
              value={
                <DocumentList
                  documents={Akte?.documents}
                  isExpandedView={false}
                />
              }
            />
          </>
        )}
      </PageContent>
    </DetailPage>
  );
}
