import { Paragraph } from '@amsterdam/design-system-react';

import { useCommunicatievoorkeuren } from './useCommunicatieVoorkeuren';
import ThemaPaginaTable from '../../../../components/Thema/ThemaPaginaTable';

export function CommunicatieVoorkeuren() {
  const { voorkeuren, displayProps, title } = useCommunicatievoorkeuren();

  return (
    <ThemaPaginaTable
      title={title}
      subTitle={
        <Paragraph className="ams-mb-m">
          Dit is een lijst van communicatievoorkeuren.
        </Paragraph>
      }
      zaken={voorkeuren}
      displayProps={displayProps}
    />
  );
}
