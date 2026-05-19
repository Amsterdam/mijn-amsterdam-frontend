import { useKlantcontactData } from './useKlantcontactData.hook.tsx';
import { AfspraakCard } from '../../../components/AfspraakCard/AfspraakCard.tsx';
import { PageContentCell, PageV2 } from '../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../hooks/useHTMLDocumentTitle.ts';

export function AfspraakListPage() {
  const { afspraken, themaConfig, breadcrumbs } = useKlantcontactData();
  useHTMLDocumentTitle(themaConfig.listPageAfspraken.route);
  return (
    <PageV2 heading="Alle afspraken" breadcrumbs={breadcrumbs}>
      <PageContentCell>
        {afspraken.map((afspraak) => (
          <AfspraakCard key={afspraak.caseReference} afspraak={afspraak} />
        ))}
      </PageContentCell>
    </PageV2>
  );
}
