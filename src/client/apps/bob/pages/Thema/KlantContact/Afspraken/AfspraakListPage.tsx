import { Column, Paragraph } from '@amsterdam/design-system-react';

import { AfspraakCard } from '../../../../../../components/AfspraakCard/AfspraakCard.tsx';
import {
  PageV2,
  PageContentCell,
} from '../../../../../../components/Page/Page.tsx';
import { useHTMLDocumentTitle } from '../../../../../../hooks/useHTMLDocumentTitle.ts';
import { useKlantcontactData } from '../useKlantcontactData.hook.tsx';

export function AfspraakListPage() {
  const { afspraken, themaConfig, breadcrumbs } = useKlantcontactData();
  useHTMLDocumentTitle(themaConfig.listPageAfspraken.route);
  return (
    <PageV2 heading="Alle afspraken" breadcrumbs={breadcrumbs}>
      <PageContentCell spanWide={10}>
        <Paragraph className="ams-mb-m">
          Hier ziet u niet al uw afspraken. In het overzicht ziet u alleen de
          afspraken waarbij we uw persoonsgegevens nodig hebben om uw vraag te
          beantwoorden.
        </Paragraph>
        <Column gap="large">
          {afspraken.map((afspraak) => (
            <AfspraakCard key={afspraak.caseReference} afspraak={afspraak} />
          ))}
        </Column>
      </PageContentCell>
    </PageV2>
  );
}
