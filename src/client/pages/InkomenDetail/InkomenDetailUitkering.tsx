import { useCallback } from 'react';

import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { PageContentCell } from '../../components/Page/Page';
import { ExternalUrls } from '../../config/app';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export const MAX_STEP_COUNT_WPI_REQUEST = 4;

export default function InkomenDetailUitkering() {
  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <PageContentCell spanWide={6}>
            <Paragraph className="ams-mb--sm">
              Hieronder ziet u de status van uw aanvraag voor een
              bijstandsuitkering. Het duurt maximaal 3 werkdagen voordat uw
              documenten over de bijstandsuitkering in Mijn Amsterdam staan.
            </Paragraph>

            <LinkList>
              <LinkList.Link
                rel="noreferrer"
                href={ExternalUrls.WPI_BIJSTANDSUITKERING}
              >
                Meer informatie over de bijstandsuitkering
              </LinkList.Link>
            </LinkList>
          </PageContentCell>
        </>
      );
    },
    []
  );

  return (
    <StatusDetail
      thema="INKOMEN"
      stateKey="WPI_AANVRAGEN"
      pageContent={pageContent}
      documentPathForTracking={(document) =>
        `/downloads/inkomen/bijstandsuitkering/${document.title.replace(
          /\\n/,
          ''
        )}`
      }
    />
  );
}
