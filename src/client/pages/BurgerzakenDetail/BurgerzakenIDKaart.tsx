import { useParams } from 'react-router-dom';

import styles from './BurgerzakenDetail.module.scss';
import { AppRoutes } from '../../../universal/config/routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import { defaultDateFormat } from '../../../universal/helpers/date';
import { capitalizeFirstLetter } from '../../../universal/helpers/text';
import {
  DetailPage,
  ErrorAlert,
  InfoDetail,
  LoadingContent,
  PageContent,
  PageHeading,
  ThemaIcon,
} from '../../components';
import { ThemaTitles } from '../../config/thema';
import { useAppStateGetter } from '../../hooks/useAppState';

export default function BurgerzakenIDKaart() {
  const { BRP } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();

  const DocumentItem = BRP.content?.identiteitsbewijzen?.find(
    (item) => item.id === id
  );
  const noContent = !isLoading && !DocumentItem;

  return (
    <DetailPage>
      <PageHeading
        icon={<ThemaIcon />}
        backLink={{
          to: AppRoutes.BURGERZAKEN,
          title: ThemaTitles.BURGERZAKEN,
        }}
        isLoading={isLoading(BRP)}
      >
        {capitalizeFirstLetter(DocumentItem?.title || 'Document')}
      </PageHeading>

      <PageContent className={styles.DetailPageContent}>
        {(isError(BRP) || noContent) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}
        {isLoading(BRP) && (
          <LoadingContent className={styles.LoadingContentInfo} />
        )}
        {!!DocumentItem && (
          <>
            <InfoDetail
              label="Documentnummer"
              value={DocumentItem.documentNummer}
            />
            <InfoDetail
              label="Datum uitgifte"
              value={defaultDateFormat(DocumentItem.datumUitgifte)}
            />
            <InfoDetail
              label="Geldig tot"
              value={defaultDateFormat(DocumentItem.datumAfloop)}
            />
          </>
        )}
      </PageContent>
    </DetailPage>
  );
}
