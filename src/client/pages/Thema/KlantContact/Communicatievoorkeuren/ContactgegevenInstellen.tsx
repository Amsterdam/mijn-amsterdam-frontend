import { useNavigate } from 'react-router';

import { ContactgegevenType } from './CommunicatieVoorkeuren-config.ts';
import { EmailInstellen } from './EmailvoorkeurInstellen.tsx';
import { useCommunicatieVoorkeurInstellen } from './useCommunicatieVoorkeuren.ts';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import ThemaDetailPagina from '../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { useKlantcontactData } from '../useKlantcontactData.hook.tsx';

export function ContactgegevenInstellen() {
  const { themaConfig, breadcrumbs, isLoading, isError } =
    useKlantcontactData();
  const { contactgegevenType, title, update, routeConfig } =
    useCommunicatieVoorkeurInstellen();
  useHTMLDocumentTitle(routeConfig);

  const navigate = useNavigate();
  function navigateToThemaPage() {
    navigate(themaConfig.route.path);
  }

  return (
    <ThemaDetailPagina
      title={title}
      themaId={themaConfig.id}
      zaak={{}}
      isLoading={false}
      isError={false}
      breadcrumbs={breadcrumbs}
      pageContentMain={
        contactgegevenType && (
          <PageContentCell spanWide={8}>
            {contactgegevenType === ContactgegevenType.Email && (
              <EmailInstellen
                onFinished={(email) => {
                  update({
                    type: ContactgegevenType.Email,
                    value: email,
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
