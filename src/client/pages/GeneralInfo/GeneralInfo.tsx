import React, { useContext } from 'react';
import { isError, isLoading } from '../../../universal/helpers';
import { AppContext } from '../../AppState';
import {
  Alert,
  InnerHtml,
  LoadingContent,
  PageContent,
  PageHeading,
  TextPage,
} from '../../components';

export default () => {
  const { CMS_CONTENT } = useContext(AppContext);
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
};
