import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { wpiLinks } from './Inkomen-thema-config.ts';
import { useInkomenDetailData } from './useInkomenDetailData.hook.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph className="ams-mb-m">
      Hieronder ziet u de status van uw aanvraag TONK. Als u meerdere aanvragen
      voor de TONK hebt gedaan, dan krijgt u 1 besluit als antwoord op al deze
      aanvragen. Het duurt maximaal 3 werkdagen voordat uw documenten over de
      TONK in Mijn Amsterdam staan.
    </Paragraph>
    <LinkList>
      <LinkList.Link rel="noreferrer" href={wpiLinks.TONK}>
        Meer informatie over de TONK
      </LinkList.Link>
    </LinkList>
  </PageContentCell>
);

export function InkomenDetailTonk() {
  const { isLoading, isError, zaak, breadcrumbs, routeConfig } =
    useInkomenDetailData('WPI_TONK');
  useHTMLDocumentTitle(routeConfig.detailPageTonk);

  return (
    <ThemaDetailPagina
      title={zaak?.title || 'TONK aanvraag'}
      zaak={zaak}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={pageContentTop}
      breadcrumbs={breadcrumbs}
    />
  );
}
