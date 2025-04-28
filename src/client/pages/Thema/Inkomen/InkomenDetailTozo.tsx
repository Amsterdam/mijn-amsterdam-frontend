import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { wpiLinks } from './Inkomen-thema-config';
import { useInkomenDetailData } from './useInkomenDetailData.hook';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function InkomenDetailTozo() {
  const { isLoading, isError, zaak, breadcrumbs, routeConfig } =
    useInkomenDetailData('WPI_TOZO');
  useHTMLDocumentTitle(routeConfig.detailPageTozo);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb--sm">
        Hieronder ziet u de status van uw aanvraag voor de{' '}
        {zaak?.about || 'Tozo'}. Als u meerdere aanvragen voor de{' '}
        {zaak?.about || 'Tozo'} hebt gedaan, dan krijgt u 1 besluit als antwoord
        op al uw aanvragen voor de {zaak?.about || 'Tozo'}. Het duurt maximaal 3
        werkdagen voordat uw documenten over de {zaak?.about || 'Tozo'} in Mijn
        Amsterdam staan.
      </Paragraph>
      <LinkList>
        <LinkList.Link rel="noreferrer" href={wpiLinks.TOZO}>
          Meer informatie over de Tozo
        </LinkList.Link>
      </LinkList>
    </PageContentCell>
  );

  return (
    <ThemaDetailPagina
      title={zaak?.title || 'TOZO aanvraag'}
      zaak={zaak}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={pageContentTop}
      breadcrumbs={breadcrumbs}
    />
  );
}
