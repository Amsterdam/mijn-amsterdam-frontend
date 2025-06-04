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
  const pageContent = CMS_CONTENT.content;

  return (
    <TextPageV2>
      <PageContentV2>
        <PageHeadingV2>
          {pageContent?.title || 'Over Mijn Amsterdam'}
        </PageHeadingV2>
        <PageContentCell>
          {(isError(CMS_CONTENT) ||
            (pageContent === null && !isLoading(CMS_CONTENT))) && (
            <ErrorAlert>
              We kunnen de inhoud van deze pagina nu niet weergeven.
            </ErrorAlert>
          )}
          {isLoading(CMS_CONTENT) && <LoadingContent />}
          {pageContent?.content && (
            <InnerHtml>{pageContent?.content}</InnerHtml>
          )}
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
