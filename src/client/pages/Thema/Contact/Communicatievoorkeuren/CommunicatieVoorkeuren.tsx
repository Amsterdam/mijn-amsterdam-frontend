import { Paragraph } from '@amsterdam/design-system-react';

import { useCommunicatievoorkeuren } from './useCommunicatieVoorkeuren';
import ThemaPaginaTable from '../../../../components/Thema/ThemaPaginaTable';
import type { CommunicatievoorkeurFrontend } from '../Contact-thema-config';

export function CommunicatieVoorkeuren() {
  const { voorkeuren, displayProps, title, listPageRoute } =
    useCommunicatievoorkeuren();

  return (
    <ThemaPaginaTable<CommunicatievoorkeurFrontend>
      title={title}
      subTitle={
        <Paragraph className="ams-mb-m">
          Dit is een lijst van communicatievoorkeuren.
        </Paragraph>
      }
      zaken={voorkeuren}
      displayProps={displayProps}
      listPageRoute={listPageRoute}
    />
  );
}
