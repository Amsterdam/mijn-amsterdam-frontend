import { useCallback } from 'react';

import {
  Grid,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';

import { ExternalUrls } from '../../config/app';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export default function InkomenDetailTozo() {
  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <Grid.Cell span="all">
            <Paragraph>
              Hieronder ziet u de status van uw aanvraag voor de{' '}
              {inkomenItem?.about || 'Tozo'}. Als u meerdere aanvragen voor de{' '}
              {inkomenItem?.about || 'Tozo'} hebt gedaan, dan krijgt u 1 besluit
              als antwoord op al uw aanvragen voor de{' '}
              {inkomenItem?.about || 'Tozo'}. Het duurt maximaal 3 werkdagen
              voordat uw documenten over de {inkomenItem?.about || 'Tozo'} in
              Mijn Amsterdam staan.
            </Paragraph>
          </Grid.Cell>
          <Grid.Cell span="all">
            <LinkList>
              <LinkList.Link rel="noreferrer" href={ExternalUrls.WPI_TOZO}>
                Meer informatie over de Tozo
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
      stateKey="WPI_TOZO"
      pageContent={pageContent}
      statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
      documentPathForTracking={(document) =>
        `/downloads/inkomen/tozo/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
