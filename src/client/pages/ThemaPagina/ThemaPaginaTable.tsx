import { Grid, Paragraph } from '@amsterdam/design-system-react';
import { ZaakDetail } from '../../../universal/types';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { DisplayProps, TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

interface ThemaPaginaTableProps<T> {
  className?: string;
  displayProps?: DisplayProps<T>;
  listPageRoute?: string;
  maxItems?: number | -1;
  textNoContent?: string;
  subTitle?: string;
  title?: string;
  zaken: T[];
}

export default function ThemaPaginaTable<T extends object = ZaakDetail>({
  title = 'Zaken',
  subTitle = '',
  zaken,
  className,
  textNoContent = 'U heeft (nog) geen zaken.',
  displayProps,
  listPageRoute,
  maxItems = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
}: ThemaPaginaTableProps<T>) {
  return (
    <Grid.Cell span="all">
      <TableV2
        showTHead={!!zaken.length}
        caption={title}
        subTitle={subTitle}
        items={maxItems !== -1 ? zaken.slice(0, maxItems) : zaken}
        displayProps={displayProps ?? null}
        className={className}
      />

      {!zaken.length && <Paragraph>{textNoContent}</Paragraph>}

      {!!listPageRoute && (
        <LinkToListPage label="" count={zaken.length} route={listPageRoute} />
      )}
    </Grid.Cell>
  );
}
