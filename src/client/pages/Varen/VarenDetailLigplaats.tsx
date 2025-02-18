import {
  ActionGroup,
  Grid,
  GridColumnNumber,
  Icon,
} from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import styles from './Varen.module.scss';
import {
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

const DEFAULT_GRID_SPAN: GridColumnNumber = 4;
export function VarenDetailPageContentLigplaats({
  vergunning,
  buttonItems,
}: VarenDetailPageContentProps) {
  const rows: RowSet[] = [
    {
      rows: [
        {
          label: 'Zaaknummer',
          content: vergunning.identifier,
          span: DEFAULT_GRID_SPAN,
        },
      ],
    },
    {
      rows: [
        {
          label: 'Locatie ligplaats',
          content: vergunning.location,
          span: DEFAULT_GRID_SPAN,
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
