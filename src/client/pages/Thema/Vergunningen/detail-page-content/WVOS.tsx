import { UnorderedList } from '@amsterdam/design-system-react';

import { commonTransformers, getRows } from './fields-config';
import {
  VergunningFrontend,
  WerkzaamhedenEnVervoerOpStraat,
} from '../../../../../server/services/vergunningen/config-and-types';
import { Datalist } from '../../../../components/Datalist/Datalist';

export function WVOSContent({
  vergunning,
}: {
  vergunning: VergunningFrontend<WerkzaamhedenEnVervoerOpStraat>;
}) {
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.kentekens,
    {
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
    },
    commonTransformers.decision,
  ]);

  return <Datalist rows={rows} />;
}
