import { Paragraph } from '@amsterdam/design-system-react';

import { BFF500_PAGE_DOCUMENT_TITLE } from './BffError-routes';
import { IS_PRODUCTION } from '../../../universal/config/env';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import { PageContentCell, PageV2 } from '../../components/Page/Page';
import { useHTMLDocumentTitle } from '../../hooks/useHTMLDocumentTitle';

export function BFF500Error() {
  useHTMLDocumentTitle({
    documentTitle: BFF500_PAGE_DOCUMENT_TITLE,
  });

  const queryParams = new URL(location.href).searchParams;
  let stack = '';
  try {
    stack = !IS_PRODUCTION && JSON.parse(queryParams.get('stack') as string);
  } catch (error) {
    stack = queryParams.get('stack') as string;
    console.error(error);
  }

  return (
    <PageV2 heading="500 - Api Error" showBreadcrumbs={false}>
      <PageContentCell>
        <Paragraph className="ams-mb-xl">
          Er is een fout opgetreden in de communicatie met de server.{' '}
          <MaRouterLink href="/">Ga verder naar home.</MaRouterLink>
        </Paragraph>
        {!IS_PRODUCTION && (
          <pre style={{ whiteSpace: 'break-spaces' }}>{stack}</pre>
        )}
      </PageContentCell>
    </PageV2>
  );
}
