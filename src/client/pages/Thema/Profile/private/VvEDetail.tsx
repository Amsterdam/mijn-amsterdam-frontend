import { Column, Link, Paragraph } from '@amsterdam/design-system-react';

import { useProfileData } from './useProfileData.hook.tsx';
import { useWonenThemaData } from './useWonenThemaData.hook.ts';
import type { VvEDataFrontend } from '../../../../../server/services/wonen/zwd.types.ts';
import type { ZaakAanvraagDetail } from '../../../../../universal/types/App.types.ts';
import {
  Datalist,
  type Row,
  type RowSet,
} from '../../../../components/Datalist/Datalist.tsx';
import { DataView } from '../../../../components/DataView/DataView.tsx';
import { PageContentCell } from '../../../../components/Page/Page.tsx';
import { ThemaDetailPagina } from '../../../../components/Thema/ThemaDetailPagina.tsx';
import { useHTMLDocumentTitle } from '../../../../hooks/useHTMLDocumentTitle.ts';
import { themaConfig } from '../Profile-thema-config.ts';

type VveDetailsProps = {
  vve: VvEDataFrontend;
};

function TransformZWDCases(
  cases: VvEDataFrontend['cases']
): ZaakAanvraagDetail[] {
  return cases.map((c) => ({
    id: String(c.id),
    title: c.adviceType,
    steps: [],
    link: {
      to: themaConfig.BRP.detailPageVvE.route.path,
      title: 'Bekijk details',
    },
    displayStatus: c.status,
    lastUpdated: c.updated,
  }));
}

function VveDetail({ vve }: VveDetailsProps) {
  const rows: Array<Row | RowSet> = [
    {
      label: 'Statutaire naam',
      content: vve.name,
    },
    {
      label: 'Aantal wooneenheden in de VvE',
      content: vve.numberOfApartments,
    },
    {
      label: 'Bouwjaar',
      content: vve.buildYear,
    },
    {
      label: 'Beschermd stads-/dorpsgezicht',
      content: vve.beschermdStadsdorpsgezicht,
    },
    {
      label: 'KvK nummer',
      content: vve.kvkNummer || null,
    },
    {
      label: 'Monumentstatus',
      content: vve.monumentStatus ? 'Ja' : 'Nee',
      isVisible: themaConfig.BRP.featureToggle.vveMonumentstatusActive,
    },
  ].filter((row) => !!row.content);

  return (
    <>
      <PageContentCell spanWide={8}>
        <Column>
          <Paragraph>
            Hieronder staan de gegevens van uw Vereniging van Eigenaren (VvE){' '}
            zoals wij die hebben. Geef aan ons door als gegevens niet kloppen.
            Op{' '}
            <Link
              href="https://www.amsterdam.nl/stelselpedia/terugmelden/"
              rel="noopener noreferrer"
            >
              Terugmelden op basisgegevens en stelselrelaties
            </Link>{' '}
            leest u hoe u dit doet.
          </Paragraph>
          {vve.isPriorityNeighborhood && (
            <Paragraph>
              Wilt u VVE uw woning verduurzamen?{' '}
              <Link
                href="https://duurzaamwonen.amsterdam/vve/gratis-verduurzamingsadvies-voor-vves"
                rel="external noopener"
              >
                Vraag hier gratis advies aan.
              </Link>
            </Paragraph>
          )}
        </Column>
      </PageContentCell>
      <PageContentCell>
        <Datalist rows={rows} />
      </PageContentCell>
      <PageContentCell>
        <DataView
          displayProps={{
            title: 'Aanvraag',
            displayStatus: 'Status',
          }}
          items={TransformZWDCases(vve.cases)}
        />
      </PageContentCell>
    </>
  );
}

export function VvEDetail() {
  const { vve, isLoading, isError, breadcrumbs } = useWonenThemaData();
  const { themaConfig } = useProfileData();
  useHTMLDocumentTitle(themaConfig.BRP.detailPageVvE.route);
  return (
    <ThemaDetailPagina
      themaId={themaConfig.BRP.id}
      title="Vereniging van Eigenaren"
      zaak={{}} // empty object to prevent info block: "Geen gegevens gevonden"
      isError={isError}
      isLoading={isLoading}
      pageContentMain={vve && <VveDetail vve={vve} />}
      breadcrumbs={breadcrumbs}
    />
  );
}
