import { Paragraph, StandaloneLink } from '@amsterdam/design-system-react';

import { PageContentCell } from '../../../../../components/Page/Page.tsx';
import { ThemaDetailPagina } from '../../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';
import { wpiLinks } from './Inkomen-thema-config.ts';
import { useInkomenDetailData } from './useInkomenDetailData.hook.ts';

const pageContentTop = (
  <PageContentCell spanWide={8}>
    <Paragraph className="ams-mb-m">
      Hieronder ziet u de status van uw aanvraag voor bijzondere bijstand.
    </Paragraph>
    <StandaloneLink rel="noreferrer" href={wpiLinks.BIJZONDERE_BIJSTAND}>
      Meer informatie over de bijzondere bijstand
    </StandaloneLink>
  </PageContentCell>
);

export function InkomenDetailBijzondereBijstand() {
  const { isLoading, isError, zaak, breadcrumbs, themaConfig } =
    useInkomenDetailData('WPI_AANVRAGEN');
  useHTMLDocumentTitle(themaConfig.detailPageBijzondereBijstand.route);

  return (
    <ThemaDetailPagina
      themaId={themaConfig.id}
      title={zaak?.title || 'Aanvraag bijzondere bijstand'}
      zaak={zaak}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={pageContentTop}
      breadcrumbs={breadcrumbs}
    />
  );
}
