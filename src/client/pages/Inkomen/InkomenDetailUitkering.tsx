import { LinkList, Paragraph } from '@amsterdam/design-system-react';

import { useInkomenDetailData } from './useInkomenDetailData.hook';
import { PageContentCell } from '../../components/Page/Page';
import { ExternalUrls } from '../../config/app';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

const pageContentTop = (
  <PageContentCell spanWide={6}>
    <Paragraph className="ams-mb--sm">
      Hieronder ziet u de status van uw aanvraag voor een bijstandsuitkering.
      Het duurt maximaal 3 werkdagen voordat uw documenten over de
      bijstandsuitkering in Mijn Amsterdam staan.
    </Paragraph>

    <LinkList>
      <LinkList.Link
        rel="noreferrer"
        href={ExternalUrls.WPI_BIJSTANDSUITKERING}
      >
        Meer informatie over de bijstandsuitkering
      </LinkList.Link>
    </LinkList>
  </PageContentCell>
);

export function InkomenDetailUitkering() {
  const { isLoading, isError, zaak, breadcrumbs } =
    useInkomenDetailData('WPI_AANVRAGEN');

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
