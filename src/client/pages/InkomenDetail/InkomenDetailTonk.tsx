import { useCallback } from 'react';
import Linkd from '../../components/Button/Button';
import { ExternalUrls } from '../../config/app';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';
import {
  Grid,
  Link,
  LinkList,
  Paragraph,
} from '@amsterdam/design-system-react';

export default function InkomenDetailTonk() {
  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <Grid.Cell span="all">
            <Paragraph>
              Hieronder ziet u de status van uw aanvraag TONK. Als u meerdere
              aanvragen voor de TONK hebt gedaan, dan krijgt u 1 besluit als
              antwoord op al deze aanvragen. Het duurt maximaal 3 werkdagen
              voordat uw documenten over de TONK in Mijn Amsterdam staan.
            </Paragraph>
          </Grid.Cell>
          <Grid.Cell span="all">
            <LinkList>
              <LinkList.Link rel="noreferrer" href={ExternalUrls.WPI_TONK}>
                Meer informatie over de TONK
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
      stateKey="WPI_TONK"
      pageContent={pageContent}
      maxStepCount={() => -1}
      highlightKey={false}
      statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
      documentPathForTracking={(document) =>
        `/downloads/inkomen/tonk/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
