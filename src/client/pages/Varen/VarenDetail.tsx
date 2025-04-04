import { useVarenDetailPage } from './useVarenDetailPage.hook';
import { VarenDetailPageContentExploitatie } from './VarenDetailExploitatie';
import { VarenDetailPageContentExploitatieHernoemen } from './VarenDetailExploitatieHernoemen';
import { VarenDetailPageContentExploitatieOverdragen } from './VarenDetailExploitatieOverdragen';
import { VarenDetailPageContentExploitatieVerbouwen } from './VarenDetailExploitatieVerbouwen';
import { VarenDetailPageContentExploitatieVervangen } from './VarenDetailExploitatieVervangen';
import { VarenDetailPageContentLigplaats } from './VarenDetailLigplaats';
import type { VarenZakenFrontend } from '../../../server/services/varen/config-and-types';
import { AppRoutes } from '../../../universal/config/routes';
import { ThemaIcon } from '../../components';
import { ThemaTitles } from '../../config/thema';
import ThemaDetailPagina from '../ThemaPagina/ThemaDetailPagina';

export function VarenDetail() {
  const {
    vergunning: zaak,
    buttonItems,
    isLoading,
    isError,
  } = useVarenDetailPage();

  let noContentError = false;
  let pageContent = null;
  switch (zaak?.caseType) {
    case 'Varen vergunning exploitatie':
      pageContent = (
        <VarenDetailPageContentExploitatie
          zaak={zaak}
          buttonItems={buttonItems}
        />
      );
      break;
    case 'Varen ligplaatsvergunning':
      pageContent = (
        <VarenDetailPageContentLigplaats
          zaak={zaak}
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
    default:
      noContentError = true;
  }

  return (
    <ThemaDetailPagina<VarenZakenFrontend>
      statusLabel="Status van uw aanvraag"
      title={zaak?.title ?? 'Varen vergunning'}
      zaak={zaak}
      isError={isError || noContentError}
      isLoading={isLoading}
      icon={<ThemaIcon />}
      pageContentTop={pageContent}
      backLink={{
        title: ThemaTitles.VAREN,
        to: AppRoutes.VAREN,
      }}
    />
  );
}
