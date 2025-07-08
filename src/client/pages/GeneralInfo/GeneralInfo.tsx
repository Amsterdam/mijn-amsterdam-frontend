import { GENERAL_INFO_PAGE_DOCUMENT_TITLE } from './GeneralInfo-routes.ts';
import { isError, isLoading } from '../../../universal/helpers/api.ts';
import ErrorAlert from '../../components/Alert/Alert.tsx';
import LoadingContent from '../../components/LoadingContent/LoadingContent.tsx';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page.tsx';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2.tsx';
import { parseHTML } from '../../helpers/html-react-parse.tsx';
import { useAppStateGetter } from '../../hooks/useAppState.ts';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle.ts';

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
          {parseHTML(generalInfo?.content)}
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
