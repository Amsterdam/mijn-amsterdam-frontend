import { Grid, Paragraph, UnorderedList } from '@amsterdam/design-system-react';
import { generatePath } from 'react-router-dom';
import { HLIRegeling } from '../../../server/services/hli/hli-regelingen-types';
import { Stadspas } from '../../../server/services/hli/stadspas-types';
import { LinkProps } from '../../../universal/types/App.types';
import { MaRouterLink } from '../../components/MaLink/MaLink';
import ThemaPagina from '../ThemaPagina/ThemaPagina';
import ZakenTable from '../ThemaPagina/ZakenTable';
import styles from './HLI.module.scss';
import { useHliThemaData } from './useHliThemaData';

function StadspasListItem({ stadspas }: { stadspas: Stadspas }) {
  return (
    <UnorderedList.Item>
      <MaRouterLink maVariant="fatNoUnderline" href={stadspas.link?.to}>
        <span className={styles.Stadspas_owner}>
          {stadspas.owner.firstname}
        </span>
        <span className={styles.Stadspas_balance}>
          Saldo {stadspas.balanceFormatted}
        </span>
      </MaRouterLink>
    </UnorderedList.Item>
  );
}

type StadspassenProps = {
  stadspassen: Stadspas[];
};

function Stadspassen({ stadspassen }: StadspassenProps) {
  return (
    <Grid.Cell span="all">
      <UnorderedList markers={false}>
        {stadspassen?.map((stadspas) => (
          <StadspasListItem key={stadspas.id} stadspas={stadspas} />
        ))}
      </UnorderedList>
      {!!stadspassen?.length && (
        <Paragraph size="small">
          Voor alle stadspassen geldt de einddatum van{' '}
          {stadspassen[0].dateEndFormatted}
        </Paragraph>
      )}
    </Grid.Cell>
  );
}

export default function ThemaPaginaHLI() {
  const {
    hasKindtegoed,
    isError,
    isLoading,
    stadspassen,
    regelingen,
    title,
    routes,
    tableConfig,
  } = useHliThemaData();

  const pageContentTop = (
    <Paragraph>
      Hieronder ziet u al uw voorzieningen. Indien u of uw kinderen in bezit
      zijn van een Stadspas ziet u ook de stadspasgegevens.
    </Paragraph>
  );

  const linkListItems: LinkProps[] = [
    {
      to: 'https://www.amsterdam.nl/werk-inkomen/hulp-bij-laag-inkomen/',
      title: 'Meer informatie over regelingen',
    },
    {
      to: 'https://www.amsterdam.nl/stadspas',
      title: 'Meer informatie over Stadspas',
    },
  ];

  if (hasKindtegoed) {
    linkListItems.push({
      to: 'https://www.amsterdam.nl/stadspas/kindtegoed/kosten-terugvragen/',
      title: 'Meer informatie over Kindtegoed declareren',
    });
  }

  const tables = Object.entries(tableConfig).map(
    ([
      kind,
      {
        title,
        displayProps,
        filter: regelingenListFilter,
        sort: regelingenListSort,
        maxItems,
        className,
      },
    ]) => {
      return (
        <ZakenTable<HLIRegeling>
          key={kind}
          title={title}
          className={className}
          zaken={regelingen
            .filter(regelingenListFilter)
            .sort(regelingenListSort)}
          listPageRoute={generatePath(routes.listPage, {
            kind,
          })}
          displayProps={displayProps}
          textNoContent={`U heeft geen ${title.toLowerCase()}`}
          maxItems={maxItems}
        />
      );
    }
  );

  return (
    <ThemaPagina
      title={title}
      pageContentTop={pageContentTop}
      linkListItems={linkListItems}
      pageContentTables={
        <>
          {!!stadspassen?.length && <Stadspassen stadspassen={stadspassen} />}
          {tables}
        </>
      }
      isError={isError}
      isLoading={isLoading}
    />
  );
}
