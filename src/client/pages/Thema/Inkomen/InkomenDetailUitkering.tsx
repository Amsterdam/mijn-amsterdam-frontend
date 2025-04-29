import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { wpiLinks } from './Inkomen-thema-config';
import { useInkomenDetailData } from './useInkomenDetailData.hook';
import { PageContentCell } from '../../../components/Page/Page';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph className="ams-mb--sm">
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
