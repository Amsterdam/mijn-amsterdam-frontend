import { Paragraph } from '@amsterdam/design-system-react';

import { useInkomenDetailData } from './useInkomenDetailData.hook';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

export function InkomenDetailTozo() {
  const { isLoading, isError, zaak, breadcrumbs, themaConfig } =
    useInkomenDetailData('WPI_TOZO');
  useHTMLDocumentTitle(themaConfig.detailPageTozo.route);

  const pageContentTop = (
    <PageContentCell spanWide={8}>
      <Paragraph className="ams-mb-m">
        Hieronder ziet u de status van uw aanvraag voor de{' '}
        {zaak?.about || 'Tozo'}. Als u meerdere aanvragen voor de{' '}
        {zaak?.about || 'Tozo'} hebt gedaan, dan krijgt u 1 besluit als antwoord
        op al uw aanvragen voor de {zaak?.about || 'Tozo'}. Het duurt maximaal 3
        werkdagen voordat uw documenten over de {zaak?.about || 'Tozo'} in Mijn
        Amsterdam staan.
      </Paragraph>
    </PageContentCell>
  );

  return (
    <ThemaDetailPagina
      themaId={themaConfig.id}
      title={zaak?.title || 'TOZO aanvraag'}
      zaak={zaak}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={pageContentTop}
      breadcrumbs={breadcrumbs}
    />
  );
}
