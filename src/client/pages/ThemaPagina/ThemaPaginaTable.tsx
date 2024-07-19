import { Grid, Paragraph } from '@amsterdam/design-system-react';
import { Unshaped, ZaakDetail } from '../../../universal/types';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { DisplayProps, TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const DISPLAY_PROPS_DEFAULT = { title: 'Titel' };

interface ThemaPaginaTableProps<T> {
  title?: string;
  zaken: T[];
  className?: string;
  textNoContent?: string;
  displayProps?: DisplayProps<T>;
  listPageRoute: string;
  maxItems?: number;
}

export default function ThemaPaginaTable<T extends ZaakDetail>({
  title = 'Zaken',
  zaken,
  className,
  textNoContent = 'U heeft (nog) geen zaken.',
  displayProps = DISPLAY_PROPS_DEFAULT,
  listPageRoute,
  maxItems = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
}: ThemaPaginaTableProps<T>) {
  return (
    <Grid.Cell span="all">
      <TableV2
        showTHead={!!zaken.length}
        caption={title}
        items={zaken.slice(0, maxItems)}
        displayProps={displayProps}
        className={className}
      />

      {!zaken.length && <Paragraph>{textNoContent}</Paragraph>}

      <LinkToListPage count={zaken.length} route={listPageRoute} />
    </Grid.Cell>
  );
}
