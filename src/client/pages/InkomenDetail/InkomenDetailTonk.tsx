import { useCallback } from 'react';

import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { PageContentCell } from '../../components/Page/Page';
import { ExternalUrls } from '../../config/app';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export default function InkomenDetailTonk() {
  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <PageContentCell spanWide={6}>
            <Paragraph className="ams-mb--sm">
              Hieronder ziet u de status van uw aanvraag TONK. Als u meerdere
              aanvragen voor de TONK hebt gedaan, dan krijgt u 1 besluit als
              antwoord op al deze aanvragen. Het duurt maximaal 3 werkdagen
              voordat uw documenten over de TONK in Mijn Amsterdam staan.
            </Paragraph>
            <LinkList>
              <LinkList.Link rel="noreferrer" href={ExternalUrls.WPI_TONK}>
                Meer informatie over de TONK
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
      stateKey="WPI_TONK"
      pageContent={pageContent}
      statusLabel={(statusItem) => `${statusItem?.about}-aanvraag`}
      documentPathForTracking={(document) =>
        `/downloads/inkomen/tonk/${document.title.split(/\n/)[0]}`
      }
    />
  );
}
