import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { wpiLinks } from './Inkomen-thema-config';
import { useInkomenDetailData } from './useInkomenDetailData.hook';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

const pageContentTop = (
  <PageContentCell spanWide={8}>
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
      <LinkList.Link rel="noreferrer" href={wpiLinks.BBZ}>
        Meer informatie over het Bbz
      </LinkList.Link>
    </LinkList>
  </PageContentCell>
);

export function InkomenDetailBbz() {
  const { isLoading, isError, zaak, breadcrumbs, routeConfig } =
    useInkomenDetailData('WPI_BBZ');
  useHTMLDocumentTitle(routeConfig.detailPageBbz);

  return (
    <ThemaDetailPagina
      title={zaak?.title || 'Bbz aanvraag'}
      zaak={zaak}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={pageContentTop}
      breadcrumbs={breadcrumbs}
    />
  );
}
