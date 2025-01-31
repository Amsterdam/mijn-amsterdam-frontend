import { useParams } from 'react-router-dom';

import { isError, isLoading } from '../../../universal/helpers/api';
import {
  DetailPage,
  ErrorAlert,
  PageContent,
  PageHeading,
  StatusLine,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';

export function VarenDetail() {
  const { VAREN } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const Vergunning = VAREN.content?.find((item) => item.id === id);
  const noContent = !isLoading(VAREN) && !Vergunning;

  return (
    <DetailPage>
      <PageHeading>TEST DETAIL</PageHeading>
      <PageContent>
        {(isError(VAREN) || noContent) && (
          <ErrorAlert>We kunnen op dit moment geen gegevens tonen.</ErrorAlert>
        )}
        <StatusLine
          // className={styles.VergunningStatus}
          trackCategory="Vergunningen detail / status"
          items={[]}
          id="vergunning-detail"
        />
      </PageContent>
    </DetailPage>
  );
}
