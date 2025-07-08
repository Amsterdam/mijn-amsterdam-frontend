import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { wpiLinks } from './Inkomen-thema-config.ts';
import { useInkomenDetailData } from './useInkomenDetailData.hook.ts';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph className="ams-mb-m">
      Hieronder ziet u de status van uw aanvraag voor een bijstandsuitkering.
      Het duurt maximaal 3 werkdagen voordat uw documenten over de
      bijstandsuitkering in Mijn Amsterdam staan.
    </Paragraph>

    <LinkList>
      <LinkList.Link rel="noreferrer" href={wpiLinks.BIJSTANDSUITKERING}>
        Meer informatie over de bijstandsuitkering
      </LinkList.Link>
    </LinkList>
  </PageContentCell>
);

export function InkomenDetailUitkering() {
  const { isLoading, isError, zaak, breadcrumbs, routeConfig } =
    useInkomenDetailData('WPI_AANVRAGEN');
  useHTMLDocumentTitle(routeConfig.detailPageUitkering);

  return (
    <ThemaDetailPagina
      title={zaak?.title || 'Aanvraag bijstandsuitkering'}
      zaak={zaak}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={pageContentTop}
      breadcrumbs={breadcrumbs}
    />
  );
}
