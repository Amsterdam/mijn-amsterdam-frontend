import {
  ActionGroup,
  Grid,
  GridColumnNumber,
  Icon,
} from '@amsterdam/design-system-react';
import { ExternalLinkIcon } from '@amsterdam/design-system-react-icons';

import styles from './Varen.module.scss';
import type {
  VarenZakenFrontend,
  VarenVergunningLigplaatsType,
} from '../../../server/services/varen/config-and-types';
import { ButtonLinkProps } from '../../../universal/types/App.types';
import { Datalist, RowSet } from '../../components/Datalist/Datalist';
import { MaButtonLink } from '../../components/MaLink/MaLink';

type VarenDetailPageContentProps = {
  zaak: VarenZakenFrontend<VarenVergunningLigplaatsType>;
  buttonItems: ButtonLinkProps[];
};

const DEFAULT_GRID_SPAN: GridColumnNumber = 4;
export function VarenDetailPageContentLigplaats({
  zaak,
  buttonItems,
}: VarenDetailPageContentProps) {
  const rows: RowSet[] = [
    {
      rows: [
        {
          label: 'Zaaknummer',
          content: zaak.identifier,
          span: DEFAULT_GRID_SPAN,
        },
      ],
    },
    {
      rows: [
        {
          label: 'Locatie ligplaats',
          content: zaak.location,
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
          {buttonItems.map(({ to, title, isDisabled }) => (
            <MaButtonLink
              key={to}
              href={to}
              variant="secondary"
              className={styles.VarenButton}
              isDisabled={isDisabled}
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
