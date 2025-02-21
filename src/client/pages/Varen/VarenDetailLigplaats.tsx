import { ActionGroup, Grid, Icon } from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import styles from './Varen.module.scss';
import type {
  VarenFrontend,
  VarenVergunningLigplaatsType,
} from '../../../server/services/varen/config-and-types';
import { LinkProps } from '../../../universal/types';
import { Datalist, RowSet } from '../../components/Datalist/Datalist';
import { MaButtonLink } from '../../components/MaLink/MaLink';

type VarenDetailPageContentProps = {
  vergunning: VarenFrontend<VarenVergunningLigplaatsType>;
  buttonItems: LinkProps[];
};

export function VarenDetailPageContentLigplaats({
  vergunning,
  buttonItems,
}: VarenDetailPageContentProps) {
  const rows: RowSet[] = [
    {
      rows: [
        {
          label: 'Locatie ligplaats',
          content: vergunning.location,
          span: 4,
        },
      ],
    },
  ];

  return (
    <>
      <Grid.Cell span="all">
        <Datalist rows={rows} className={styles.VarenGridWithoutRowGap} />
      </Grid.Cell>
      <Grid.Cell span="all">
        <ActionGroup>
          {buttonItems.map(({ to, title }) => (
            <MaButtonLink
              key={to}
              href={to}
              variant="secondary"
              className={styles.VarenButton}
            >
              {title}
              <Icon svg={ExternalLinkIcon} size="level-5" />
            </MaButtonLink>
          ))}
        </ActionGroup>
      </Grid.Cell>
    </>
  );
}
