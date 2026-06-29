import { Paragraph } from '@amsterdam/design-system-react';

import { useZorgDetailData } from './useZorgDetailData.hook.ts';
import { isVoorzieningActieAvailable } from './Zorg-helpers.ts';
import { themaConfig } from './Zorg-thema-config.ts';
import type { WMOVoorzieningFrontend } from '../../../../server/services/jzd/wmo/wmo-types.ts';
import { ErrorAlert } from '../../../components/Alert/Alert.tsx';
import { Datalist } from '../../../components/Datalist/Datalist.tsx';
import { DocumentListV2 } from '../../../components/DocumentList/DocumentListV2.tsx';
import { MaButtonLink } from '../../../components/MaLink/MaLink.tsx';
import { PageContentCell } from '../../../components/Page/Page.tsx';
import { ThemaDetailPagina } from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

type WMODetailContentProps = {
  voorziening: WMOVoorzieningFrontend;
};

function WMODetailContent({ voorziening }: WMODetailContentProps) {
  const rows = [];
  if (voorziening?.decision) {
    rows.push({ content: voorziening?.decision, label: 'Resultaat' });
  }
  if (voorziening?.supplier) {
    rows.push({ content: voorziening?.supplier, label: 'Aanbieder' });
  }

  const isReparatieverzoekAvailable = isVoorzieningActieAvailable(
    voorziening,
    'reparatieverzoek'
  );
  const isPGBReparatieverzoek = isVoorzieningActieAvailable(
    voorziening,
    'pgb-reparatieverzoek',
    false
  );

  return (
    <>
      <PageContentCell>
        {voorziening?.disclaimer && (
          <ErrorAlert
            className="ams-mb-m"
            severity="warning"
            title="Belangrijk om te weten"
          >
            {voorziening.disclaimer}
          </ErrorAlert>
        )}
        <Datalist rows={rows} />
        {voorziening?.documents.length > 0 && (
          <DocumentListV2
            documents={voorziening.documents}
            columns={['Bestanden', 'Verzenddatum']}
          />
        )}
      </PageContentCell>
      {(isReparatieverzoekAvailable || isPGBReparatieverzoek) && (
        <PageContentCell spanWide={7}>
          {isReparatieverzoekAvailable && (
            <>
              <Paragraph className="ams-mb-m">
                Is uw woonruimteaanpassing kapot? U kunt een reparatieverzoek
                voor deze voorziening aanvragen. Klik op de knop hieronder om
                het reparatieverzoek in te dienen. U wordt dan doorgestuurd naar
                een formulier van de gemeente Amsterdam.
              </Paragraph>
              <MaButtonLink
                href={voorziening?.maActieUrls?.reparatieverzoek}
                rel="noopener noreferrer"
              >
                Reparatieverzoek indienen
              </MaButtonLink>
            </>
          )}
          {isPGBReparatieverzoek && (
            <Paragraph>
              Heeft u de woningaanpassing met een pgb aangeschaft? Dan moet u
              zelf de kosten voor reparatie en onderhoud betalen met uw pgb. Bij
              uw pgb is hiervoor een bedrag inbegrepen.
            </Paragraph>
          )}
        </PageContentCell>
      )}
    </>
  );
}

export function ZorgDetail() {
  const { title, voorziening, breadcrumbs, isError, isLoading, themaId } =
    useZorgDetailData();
  useHTMLDocumentTitle(themaConfig.detailPage.route);

  return (
    <ThemaDetailPagina
      themaId={themaId}
      title={title}
      zaak={voorziening}
      isError={isError}
      isLoading={isLoading}
      pageContentMain={
        !!voorziening && <WMODetailContent voorziening={voorziening} />
      }
      breadcrumbs={breadcrumbs}
    />
  );
}
