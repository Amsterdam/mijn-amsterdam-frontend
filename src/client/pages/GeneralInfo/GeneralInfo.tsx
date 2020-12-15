import React from 'react';
import { isError, isLoading } from '../../../universal/helpers';
import {
  Alert,
  InnerHtml,
  LoadingContent,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';
import { useAppStateGetter } from '../../hooks/useAppState';

export default function GeneralInfo() {
  const { CMS_CONTENT } = useAppStateGetter();
  const generalInfo = CMS_CONTENT.content?.generalInfo;

  return (
    <TextPage>
      <PageHeading isLoading={isLoading(CMS_CONTENT)}>
        {generalInfo?.title || 'Over Mijn Amsterdam'}
      </PageHeading>
      <PageContent>
        {isError(CMS_CONTENT) ||
          (generalInfo === null && (
            <Alert type="warning">
              <p>We kunnen de inhoud van deze pagina nu niet weergeven.</p>
            </Alert>
          ))}
        {isLoading(CMS_CONTENT) && <LoadingContent />}
        {generalInfo?.content && <InnerHtml>{generalInfo?.content}</InnerHtml>}
      </PageContent>
    </TextPage>
  );
}
