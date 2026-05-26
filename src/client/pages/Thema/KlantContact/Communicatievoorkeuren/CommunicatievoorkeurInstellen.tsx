import { useNavigate } from 'react-router';

import { EmailInstellen } from './EmailvoorkeurInstellen.tsx';
import { useCommunicatieVoorkeurInstellen } from './useCommunicatieVoorkeuren.ts';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { useKlantcontactData } from '../useKlantcontactData.hook.tsx';

export function CommunicatievoorkeurInstellen() {
  const { themaConfig, breadcrumbs, isLoading, isError } =
    useKlantcontactData();
  const { voorkeur, medium, title, update, routeConfig } =
    useCommunicatieVoorkeurInstellen();
  useHTMLDocumentTitle(routeConfig);

  const navigate = useNavigate();
  function navigateToThemaPage() {
    navigate(routeConfig.path);
  }

  return (
    <ThemaDetailPagina
      title={title}
      themaId={themaConfig.id}
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
