import { useCallback } from 'react';

import {
  Grid,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';

import { ExternalUrls } from '../../config/app';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export const MAX_STEP_COUNT_WPI_REQUEST = 4;

export default function InkomenDetailUitkering() {
  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <Grid.Cell span="all">
            <Paragraph>
              Hieronder ziet u de status van uw aanvraag voor een
              bijstandsuitkering. Het duurt maximaal 3 werkdagen voordat uw
              documenten over de bijstandsuitkering in Mijn Amsterdam staan.
            </Paragraph>
          </Grid.Cell>
          <Grid.Cell span="all">
            <LinkList>
              <LinkList.Link
                rel="noreferrer"
                href={ExternalUrls.WPI_BIJSTANDSUITKERING}
              >
                Meer informatie over de bijstandsuitkering
              </LinkList.Link>
            </LinkList>
          </Grid.Cell>
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
