import { isError, isLoading } from '../../../universal/helpers/api';
import {
  ErrorAlert,
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
            <ErrorAlert>
              We kunnen de inhoud van deze pagina nu niet weergeven.
            </ErrorAlert>
          ))}
        {isLoading(CMS_CONTENT) && <LoadingContent />}
        {generalInfo?.content && <InnerHtml>{generalInfo?.content}</InnerHtml>}
      </PageContent>
    </TextPage>
  );
}
