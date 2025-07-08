import { isVergunning } from './helper.ts';
import { useVarenDetailPage } from './useVarenDetailPage.hook.ts';
import { VarenDetailPageContentExploitatie } from './VarenDetailExploitatie.tsx';
import { VarenDetailPageContentExploitatieHernoemen } from './VarenDetailExploitatieHernoemen.tsx';
import { VarenDetailPageContentExploitatieOverdragen } from './VarenDetailExploitatieOverdragen.tsx';
import { VarenDetailPageContentExploitatieVerbouwen } from './VarenDetailExploitatieVerbouwen.tsx';
import { VarenDetailPageContentExploitatieVervangen } from './VarenDetailExploitatieVervangen.tsx';
import ThemaDetailPagina from '../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function VarenDetail() {
  const {
    zaak,
    linkedWijzigingZaak,
    hasRegistratieReder,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
    routeConfig,
  } = useVarenDetailPage();
  useHTMLDocumentTitle(routeConfig.detailPage);

  let pageContent = null;
  switch (zaak?.caseType) {
    case 'Varen vergunning exploitatie':
      pageContent = (
        <VarenDetailPageContentExploitatie
          zaak={zaak}
          linkedWijzigingZaak={linkedWijzigingZaak}
          hasRegistratieReder={hasRegistratieReder}
          buttonItems={buttonItems}
        />
      );
      break;
    case 'Varen vergunning exploitatie Wijziging vaartuignaam':
      pageContent = <VarenDetailPageContentExploitatieHernoemen zaak={zaak} />;
      break;
    case 'Varen vergunning exploitatie Wijziging vervanging':
      pageContent = <VarenDetailPageContentExploitatieVervangen zaak={zaak} />;
      break;
    case 'Varen vergunning exploitatie Wijziging verbouwing':
      pageContent = <VarenDetailPageContentExploitatieVerbouwen zaak={zaak} />;
      break;
    case 'Varen vergunning exploitatie Wijziging vergunninghouder':
      pageContent = <VarenDetailPageContentExploitatieOverdragen zaak={zaak} />;
      break;
  }

  return (
    <ThemaDetailPagina
      statusLabel="Status van uw aanvraag"
      title={zaak?.title ?? 'Varen vergunning'}
      zaak={zaak}
      isError={isError || !pageContent}
      isLoading={isLoading}
      pageContentMain={pageContent}
      breadcrumbs={breadcrumbs}
      showStatusSteps={!isVergunning(zaak)}
    />
  );
}
