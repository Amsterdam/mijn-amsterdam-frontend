import type { ReactNode } from 'react';

import { Heading, Paragraph } from '@amsterdam/design-system-react';

import type { ZaakAanvraagDetail } from '../../../universal/types/App.types.ts';
import { MAX_ZAKEN_ON_THEMA_PAGINA } from '../../config/app.ts';
import { useSmallScreen } from '../../hooks/media.hook.ts';
import { LinkToListPage } from '../LinkToListPage/LinkToListPage.tsx';
import { PageContentCell } from '../Page/Page.tsx';
import type { DisplayProps } from '../Table/TableV2.tsx';
import { TableV2 } from '../Table/TableV2.tsx';
import { ZakenList } from '../ZakenList/ZakenList.tsx';

const DISPLAY_PROPS_DEFAULT: DisplayProps<{ title: string }> = {
  title: 'Titel',
};
const TEXT_NO_CONTENT_DEFAULT = 'Er zijn (nog) geen zaken gevonden.';

interface ThemaPaginaZakenProps<T> {
  className?: string;
  displayProps?: DisplayProps<T>;
  listPageRoute?: string;
  maxItems?: number | -1;
  totalItems?: number;
  textNoContent?: string;
  contentAfterTheTitle?: ReactNode;
  title?: string;
  listPageLinkLabel?: string;
  listPageLinkTitle?: string;
  zaken: T[];
  variant?: 'table' | 'list';
}

export default function ThemaPaginaZaken<
  T extends object = ZaakAanvraagDetail,
>({
  title = '',
  contentAfterTheTitle = '',
  zaken,
  className,
  textNoContent,
  displayProps = DISPLAY_PROPS_DEFAULT,
  listPageRoute,
  maxItems = MAX_ZAKEN_ON_THEMA_PAGINA,
  totalItems,
  listPageLinkLabel = 'Toon meer',
  listPageLinkTitle,
  variant,
}: ThemaPaginaZakenProps<T>) {
  const textNoContentDefault = title
    ? `U heeft (nog) geen ${title.toLowerCase()}`
    : TEXT_NO_CONTENT_DEFAULT;

  const hasListPage = !!listPageRoute && maxItems !== -1;
  const zaken_ = hasListPage ? zaken.slice(0, maxItems) : zaken;
  const isSmallScreen = useSmallScreen();

  const list =
    (isSmallScreen && variant !== 'table') || variant === 'list' ? (
      <>
        <Heading level={2} size="level-2" className="ams-mb-m">
          {title}
        </Heading>
        {contentAfterTheTitle}
        {zaken_.length > 0 ? (
          <ZakenList<T> zaken={zaken_} displayProps={displayProps} />
        ) : (
          <Paragraph>{textNoContent ?? textNoContentDefault}</Paragraph>
        )}
      </>
    ) : (
      <TableV2
        showTHead={!!zaken.length}
        caption={title}
        contentAfterTheCaption={contentAfterTheTitle}
        items={zaken_}
        displayProps={displayProps}
        className={className}
      />
    );

  return (
    <PageContentCell>
      {list}
      {!zaken_.length && (
        <Paragraph>{textNoContent ?? textNoContentDefault}</Paragraph>
      )}

      {hasListPage && (
        <LinkToListPage
          threshold={maxItems}
          linkTitle={listPageLinkTitle ?? `Bekijk meer ${title.toLowerCase()}`}
          label={listPageLinkLabel}
          count={totalItems ?? zaken.length}
          route={listPageRoute}
        />
      )}
    </PageContentCell>
  );
}
