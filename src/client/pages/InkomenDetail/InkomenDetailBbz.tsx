import { useCallback } from 'react';

import { LinkList, Paragraph } from '@amsterdam/design-system-react';
import { useParams } from 'react-router-dom';

import { PageContentCell } from '../../components/Page/Page';
import { ExternalUrls } from '../../config/app';
import { useAppStateGetter } from '../../hooks/useAppState';
import StatusDetail, { StatusSourceItem } from '../StatusDetail/StatusDetail';

export default function InkomenDetailBbz() {
  const { WPI_BBZ } = useAppStateGetter();
  const { id } = useParams<{ id: string }>();
  const statusItem = WPI_BBZ.content?.find((item) => item.id === id);
  const hasDecisionStep =
    statusItem?.steps.some((step) => step.id.includes('besluit')) ?? false;

  const pageContent = useCallback(
    (isLoading: boolean, inkomenItem: StatusSourceItem) => {
      return (
        <>
          <PageContentCell spanWide={6}>
            <Paragraph className="ams-mb--sm">
              Hieronder ziet u de status van uw aanvraag voor een uitkering of
              lening van het Bbz. Ook als u een IOAZ uitkering heeft aangevraagd
              ziet u de status hieronder. Als u meerdere aanvragen voor het Bbz
              hebt gedaan, dan krijgt u 1 besluit als antwoord op al uw
              aanvragen voor het Bbz. Het duurt maximaal 3 werkdagen voordat uw
              documenten over het Bbz in Mijn Amsterdam staan.
            </Paragraph>
            <Paragraph className="ams-mb--sm">
              Hebt u schuldhulp aangevraagd? Dan wordt daarover contact met u
              opgenomen.
            </Paragraph>
            <LinkList>
              <LinkList.Link rel="noreferrer" href={ExternalUrls.WPI_BBZ}>
                Meer informatie over het Bbz
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
      stateKey="WPI_BBZ"
      pageContent={pageContent}
      statusLabel={() => `Bbz-aanvraag`}
      showStatusLineConnection={!hasDecisionStep} // There is no logical connection between the historic BBZ steps, therefor we do not show the checkmarks as they imply a linear proces.
      reverseSteps={hasDecisionStep} // For an unknown business reason, the historic steps of BBZ are shown in reverse.
    />
  );
}
