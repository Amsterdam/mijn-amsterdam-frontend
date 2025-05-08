import { UnorderedList } from '@amsterdam/design-system-react';

import { commonTransformers, getRows } from './fields-config';
import styles from './fields-config.module.scss';
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
  const decision = () => {
    return vergunning.processed
      ? {
          label: 'Resultaat',
          content:
            // TODO: Moeten we hier niet de decision (deels verleend / verleend?) van de vergunning gebruiken om te bepalen of we deze tekst tonen?
            vergunning.werkzaamheden.length > 1
              ? 'In het Besluit ziet u voor welke werkzaamheden u een ontheffing heeft gekregen.'
              : vergunning.decision,
        }
      : null;
  };
  const rows = getRows(vergunning, [
    commonTransformers.identifier,
    commonTransformers.location,
    commonTransformers.kentekens,
    {
      label: 'Werkzaamheden',
      content: (
        <UnorderedList className={styles.List}>
          {vergunning.werkzaamheden.map((activiteit) => (
            <UnorderedList.Item key={activiteit}>
              {activiteit}
            </UnorderedList.Item>
          ))}
        </UnorderedList>
      ),
    },
    decision,
  ]);

  return <Datalist rows={rows} />;
}
