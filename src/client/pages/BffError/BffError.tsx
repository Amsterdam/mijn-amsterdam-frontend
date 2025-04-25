import { Paragraph } from '@amsterdam/design-system-react';

import { BFF500_PAGE_DOCUMENT_TITLE } from './BffError-routes';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';

export function BFF500Error() {
  useHTMLDocumentTitle(BFF500_PAGE_DOCUMENT_TITLE);

  const queryParams = new URL(location.href).searchParams;
  let stack = '';
  try {
    stack = !IS_PRODUCTION && JSON.parse(queryParams.get('stack') as string);
  } catch (error) {
    stack = queryParams.get('stack') as string;
    console.error(error);
  }

  return (
    <TextPageV2>
      <PageContentV2 id="skip-to-id-AppContent">
        <PageHeadingV2>500 - Api Error</PageHeadingV2>
        <PageContentCell>
          <Paragraph className="ams-mb--xl">
            Er is een fout opgetreden in de communicatie met de server.{' '}
            <MaRouterLink href="/">Ga verder naar home.</MaRouterLink>
            {!IS_PRODUCTION && (
              <pre style={{ whiteSpace: 'break-spaces' }}>{stack}</pre>
            )}
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
