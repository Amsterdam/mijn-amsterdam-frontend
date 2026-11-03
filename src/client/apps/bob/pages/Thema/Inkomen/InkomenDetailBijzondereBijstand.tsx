import { Paragraph, StandaloneLink } from '@amsterdam/design-system-react';

import { wpiLinks } from './Inkomen-thema-config.ts';
import { useInkomenDetailData } from './useInkomenDetailData.hook.ts';
import { PageContentCell } from '../../../../../components/Page/Page.tsx';
import { ThemaDetailPagina } from '../../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../../hooks/useHTMLDocumentTitle.ts';

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

  const zaakZonderDocumenten = zaak
    ? {
        ...zaak,
        steps: zaak.steps.map((step) => ({ ...step, documents: [] })),
      }
    : zaak;

  return (
    <ThemaDetailPagina
      themaId={themaConfig.id}
      title={zaak?.title || 'Aanvraag bijzondere bijstand'}
      zaak={zaakZonderDocumenten}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={pageContentTop}
      breadcrumbs={breadcrumbs}
    />
  );
}
