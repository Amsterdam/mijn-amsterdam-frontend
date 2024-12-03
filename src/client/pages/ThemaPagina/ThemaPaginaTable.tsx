import { ReactNode } from 'react';

import { Grid, Paragraph } from '@amsterdam/design-system-react';

import { ZaakDetail } from '../../../universal/types';
import { LinkToListPage } from '../../components/LinkToListPage/LinkToListPage';
import { DisplayProps, TableV2 } from '../../components/Table/TableV2';
import { MAX_TABLE_ROWS_ON_THEMA_PAGINA } from '../../config/app';

const DISPLAY_PROPS_DEFAULT = { title: 'Titel' };
const TEXT_NO_CONTENT_DEFAULT = 'Er zijn (nog) geen zaken gevonden.';

interface ThemaPaginaTableProps<T> {
  className?: string;
  displayProps?: DisplayProps<T>;
  listPageRoute?: string;
  maxItems?: number | -1;
  totalItems?: number;
  textNoContent?: string;
  subTitle?: ReactNode;
  title?: string;
  listPageLinkLabel?: string;
  zaken: T[];
}

export default function ThemaPaginaTable<T extends object = ZaakDetail>({
  title = 'Zaken',
  subTitle = '',
  zaken,
  className,
  textNoContent,
  displayProps = DISPLAY_PROPS_DEFAULT,
  listPageRoute,
  maxItems = MAX_TABLE_ROWS_ON_THEMA_PAGINA,
  totalItems,
  listPageLinkLabel = 'Toon meer',
}: ThemaPaginaTableProps<T>) {
  const textNoContentDefault = title
    ? `U heeft (nog) geen ${title.toLowerCase()}`
    : TEXT_NO_CONTENT_DEFAULT;

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

      {!zaken.length && (
        <Paragraph>{textNoContent ?? textNoContentDefault}</Paragraph>
      )}

      {!!listPageRoute && maxItems !== -1 && (
        <LinkToListPage
          threshold={maxItems}
          label={listPageLinkLabel}
          count={totalItems ?? zaken.length}
          route={listPageRoute}
        />
      )}
    </Grid.Cell>
  );
}
