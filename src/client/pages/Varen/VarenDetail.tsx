import { useVarenDetailPage } from './useVarenDetailPage.hook';
import { VarenDetailPageContentExploitatie } from './VarenDetailExploitatie';
import { VarenDetailPageContentExploitatieHernoemen } from './VarenDetailExploitatieHernoemen';
import { VarenDetailPageContentExploitatieOverdragen } from './VarenDetailExploitatieOverdragen';
import { VarenDetailPageContentExploitatieVerbouwen } from './VarenDetailExploitatieVerbouwen';
import { VarenDetailPageContentExploitatieVervangen } from './VarenDetailExploitatieVervangen';
import { VarenDetailPageContentLigplaats } from './VarenDetailLigplaats';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function VarenDetail() {
  const { vergunning, buttonItems, isLoading, isError, breadcrumbs } =
    useVarenDetailPage();

  let noContentError = false;
  let pageContent = null;
  switch (vergunning?.caseType) {
    case 'Varen vergunning exploitatie':
      pageContent = (
        <VarenDetailPageContentExploitatie
          vergunning={vergunning}
          buttonItems={buttonItems}
        />
      );
      break;
    case 'Varen ligplaatsvergunning':
      pageContent = (
        <VarenDetailPageContentLigplaats
          vergunning={vergunning}
          buttonItems={buttonItems}
        />
      );
      break;
    case 'Varen vergunning exploitatie Wijziging vaartuignaam':
      pageContent = (
        <VarenDetailPageContentExploitatieHernoemen vergunning={vergunning} />
      );
      break;
    case 'Varen vergunning exploitatie Wijziging vervanging':
      pageContent = (
        <VarenDetailPageContentExploitatieVervangen vergunning={vergunning} />
      );
      break;
    case 'Varen vergunning exploitatie Wijziging verbouwing':
      pageContent = (
        <VarenDetailPageContentExploitatieVerbouwen vergunning={vergunning} />
      );
      break;
    case 'Varen vergunning exploitatie Wijziging vergunninghouder':
      pageContent = (
        <VarenDetailPageContentExploitatieOverdragen vergunning={vergunning} />
      );
      break;
    default:
      noContentError = true;
  }

  return (
    <ThemaDetailPagina
      statusLabel="Status van uw aanvraag"
      title={vergunning?.title ?? 'Varen vergunning'}
      zaak={vergunning}
      isError={isError || noContentError}
      isLoading={isLoading}
      pageContentMain={pageContent}
      breadcrumbs={breadcrumbs}
    />
  );
}
