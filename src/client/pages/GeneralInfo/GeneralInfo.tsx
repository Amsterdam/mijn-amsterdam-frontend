import { GENERAL_INFO_PAGE_DOCUMENT_TITLE } from './GeneralInfo-routes';
import { isError, isLoading } from '../../../universal/helpers/api';
import ErrorAlert from '../../components/Alert/Alert';
import InnerHtml from '../../components/InnerHtml/InnerHtml';
import LoadingContent from '../../components/LoadingContent/LoadingContent';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useAppStateGetter } from '../../hooks/useAppState';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';

export function GeneralInfo() {
  useHTMLDocumentTitle({
    documentTitle: GENERAL_INFO_PAGE_DOCUMENT_TITLE,
  });

  const { CMS_CONTENT } = useAppStateGetter();
  const generalInfo = CMS_CONTENT.content;

  return (
    <TextPageV2>
      <PageContentV2>
        <PageHeadingV2>
          {generalInfo?.title || 'Over Mijn Amsterdam'}
        </PageHeadingV2>
        <PageContentCell>
          {(isError(CMS_CONTENT) ||
            (generalInfo === null && !isLoading(CMS_CONTENT))) && (
            <ErrorAlert>
              We kunnen de inhoud van deze pagina nu niet weergeven.
            </ErrorAlert>
          )}
          {isLoading(CMS_CONTENT) && <LoadingContent />}
          {generalInfo?.content && (
            <InnerHtml>{generalInfo?.content}</InnerHtml>
          )}
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
