import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';
import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { AfspraakCards } from '../../../components/AfspraakCard/AfspraakCard.tsx';
import { PageContentCell, PageV2 } from '../../../components/Page/Page.tsx';

export function AfspraakListPage() {
  const { afspraken, themaConfig, breadcrumbs } = useKlantcontactData();
  useHTMLDocumentTitle(themaConfig.listPageAfspraken.route);

  return (
    <PageV2 heading={'Alle afspraken'} breadcrumbs={breadcrumbs}>
      <PageContentCell>
        <AfspraakCards afspraken={afspraken}></AfspraakCards>
      </PageContentCell>
    </PageV2>
  );
}
