import React, { useContext } from 'react';
import { AppContext } from '../../AppState';
import {
  TextPage,
  PageHeading,
  PageContent,
  LoadingContent,
  InnerHtml,
} from '../../components';

export default () => {
  const { CMS_CONTENT } = useContext(AppContext);
  const generalInfo = CMS_CONTENT.content?.generalInfo;

  return (
    <TextPage>
      <PageHeading>
        {generalInfo?.title || (
          <LoadingContent barConfig={[['20rem', '3rem', '0']]} />
        )}
      </PageHeading>
      <PageContent>
        {!generalInfo?.content && <LoadingContent />}
        {generalInfo?.content && <InnerHtml>{generalInfo?.content}</InnerHtml>}
      </PageContent>
    </TextPage>
  );
};
