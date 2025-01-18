import { Paragraph } from '@amsterdam/design-system-react';

import { IS_PRODUCTION } from '../../../universal/config/env';
import { LinkdInline } from '../../components';
import {
  PageContentCell,
  PageContentV2,
  TextPageV2,
} from '../../components/Page/Page';
import { PageHeadingV2 } from '../../components/PageHeading/PageHeadingV2';

export default function Bff500Error() {
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
            <LinkdInline href="/">Ga verder naar home.</LinkdInline>
            {!IS_PRODUCTION && (
              <pre style={{ whiteSpace: 'break-spaces' }}>{stack}</pre>
            )}
          </Paragraph>
        </PageContentCell>
      </PageContentV2>
    </TextPageV2>
  );
}
