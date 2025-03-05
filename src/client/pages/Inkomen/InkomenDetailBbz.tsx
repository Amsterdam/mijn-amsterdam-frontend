import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { useInkomenDetailData } from './useInkomenDetailData.hook';
import { WpiRequestProcess } from '../../../server/services/wpi/wpi-types';
import { PageContentCell } from '../../components/Page/Page';
import { ExternalUrls } from '../../config/app';
import { routes } from '../Afis/Afis-thema-config';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

const pageContentTop = (
  <PageContentCell spanWide={6}>
    <Paragraph className="ams-mb--sm">
      Hieronder ziet u de status van uw aanvraag voor een uitkering of lening
      van het Bbz. Ook als u een IOAZ uitkering heeft aangevraagd ziet u de
      status hieronder. Als u meerdere aanvragen voor het Bbz hebt gedaan, dan
      krijgt u 1 besluit als antwoord op al uw aanvragen voor het Bbz. Het duurt
      maximaal 3 werkdagen voordat uw documenten over het Bbz in Mijn Amsterdam
      staan.
    </Paragraph>
    <Paragraph className="ams-mb--sm">
      Hebt u schuldhulp aangevraagd? Dan wordt daarover contact met u opgenomen.
    </Paragraph>
    <LinkList>
      <LinkList.Link rel="noreferrer" href={ExternalUrls.WPI_BBZ}>
        Meer informatie over het Bbz
      </LinkList.Link>
    </LinkList>
  </PageContentCell>
);

export function InkomenDetailBbz() {
  const { isLoading, isError, zaak } = useInkomenDetailData('WPI_BBZ');

  const hasDecisionStep =
    zaak?.steps.some((step) => step.id.includes('besluit')) ?? false;

  const showStatusLineConnection = !hasDecisionStep; // There is no logical connection between the historic BBZ steps, therefor we do not show the checkmarks as they imply a linear proces.
  const reverseSteps = hasDecisionStep; // For an unknown business reason, the historic steps of BBZ are shown in reverse.

  return (
    <ThemaDetailPagina<WpiRequestProcess>
      title={zaak?.title || 'Bbz aanvraag'}
      zaak={zaak}
      isError={isError}
      isLoading={isLoading}
      showStatusLineConnection={showStatusLineConnection}
      reverseSteps={reverseSteps}
      pageContentMain={pageContentTop}
      backLink={routes.themaPage}
    />
  );
}
