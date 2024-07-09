import { UnorderedList } from '@amsterdam/design-system-react';
import {
  VergunningFrontendV2,
  WerkzaamhedenEnVervoerOpStraat,
} from '../../../../server/services/vergunningen-v2/config-and-types';
import { Datalist, Row } from '../../../components/Datalist/Datalist';
import { getRowsByKey } from './fields-config';

export function WVOSContent({
  vergunning,
}: {
  vergunning: VergunningFrontendV2<WerkzaamhedenEnVervoerOpStraat>;
}) {
  const rowsByKey = getRowsByKey(vergunning, [
    'identifier',
    'location',
    'decision',
  ]);

  const werkzaamheden = {
    label: 'Werkzaamheden',
    content: (
      <UnorderedList>
        {vergunning.werkzaamheden.map((activiteit) => (
          <UnorderedList.Item key={activiteit}>{activiteit}</UnorderedList.Item>
        ))}
      </UnorderedList>
    ),
  };

  const rows = [
    rowsByKey.identifier,
    rowsByKey.location,
    werkzaamheden,
    rowsByKey.decision,
  ];

  return <Datalist rows={rows} />;
}
