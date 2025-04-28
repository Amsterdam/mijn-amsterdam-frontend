import { isVergunning } from './helper';
import { useVarenDetailPage } from './useVarenDetailPage.hook';
import { VarenDetailPageContentExploitatie } from './VarenDetailExploitatie';
import { VarenDetailPageContentExploitatieHernoemen } from './VarenDetailExploitatieHernoemen';
import { VarenDetailPageContentExploitatieOverdragen } from './VarenDetailExploitatieOverdragen';
import { VarenDetailPageContentExploitatieVerbouwen } from './VarenDetailExploitatieVerbouwen';
import { VarenDetailPageContentExploitatieVervangen } from './VarenDetailExploitatieVervangen';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function VarenDetail() {
  const {
    zaak,
    linkedWijzigingZaak,
    hasRegistratieReder,
    buttonItems,
    isLoading,
    isError,
    breadcrumbs,
  } = useVarenDetailPage();

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
