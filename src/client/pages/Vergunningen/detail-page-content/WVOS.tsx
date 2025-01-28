import { UnorderedList } from '@amsterdam/design-system-react';

import { getRows } from './fields-config';
import {
  VergunningFrontend,
  WerkzaamhedenEnVervoerOpStraat,
} from '../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../components/Datalist/Datalist';

export function WVOSContent({
  vergunning,
}: {
  vergunning: VergunningFrontend<WerkzaamhedenEnVervoerOpStraat>;
}) {
  const werkzaamhedenTransformer = {
    werkzaamheden: () => {
      return {
        label: 'Werkzaamheden',
        content: (
          <UnorderedList>
            {vergunning.werkzaamheden.map((activiteit) => (
              <UnorderedList.Item key={activiteit}>
                {activiteit}
              </UnorderedList.Item>
            ))}
          </UnorderedList>
        ),
      };
    },
  };

  const rows = getRows(vergunning, [
    'identifier',
    'location',
    werkzaamhedenTransformer,
    'decision',
  ]);

  return <Datalist rows={rows} />;
}
