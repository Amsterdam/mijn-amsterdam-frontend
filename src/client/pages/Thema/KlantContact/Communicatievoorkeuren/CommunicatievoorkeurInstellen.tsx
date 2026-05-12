import { useNavigate } from 'react-router';

import { EmailInstellen } from './EmailvoorkeurInstellen.tsx';
import { useCommunicatieVoorkeurInstellen } from './useCommunicatieVoorkeuren.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { routeConfig } from '../KlantContact-thema-config.ts';

export function CommunicatievoorkeurInstellen() {
  const {
    voorkeur,
    medium,
    isLoading,
    isError,
    title,
    themaId,
    breadcrumbs,
    update,
  } = useCommunicatieVoorkeurInstellen();
  useHTMLDocumentTitle(routeConfig.detailPageCommunicatievoorkeurInstellen);

  const navigate = useNavigate();
  function navigateToThemaPage() {
    navigate(routeConfig.themaPage.path);
  }

  console.log('voorkeur', voorkeur, medium);

  return (
    <ThemaDetailPagina
      title={title}
      themaId={themaId}
      isLoading={isLoading}
      isError={isError}
      zaak={voorkeur ?? {}}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        medium && (
          <PageContentCell spanWide={8}>
            {medium.type === 'email' && (
              <EmailInstellen
                voorkeur={voorkeur}
                medium={medium}
                onFinished={(email) => {
                  update({
                    type: 'email',
                    value: email,
                    voorkeurId: voorkeur?.id,
                  });
                  navigateToThemaPage();
                }}
              />
            )}
          </PageContentCell>
        )
      }
    />
  );
}
