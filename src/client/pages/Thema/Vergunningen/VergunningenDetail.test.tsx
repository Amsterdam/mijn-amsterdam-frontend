import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, Mock } from 'vitest';

import { useVergunningenDetailData } from './useVergunningenDetailData.hook';
import { useVergunningenThemaData } from './useVergunningenThemaData.hook';
import { VergunningenDetail, forTesting } from './VergunningenDetail';
import type {
  DecosVergunning,
  DecosZaakFrontend,
} from '../../../../server/services/vergunningen/config-and-types';
import { decosCaseToZaakTransformers } from '../../../../server/services/vergunningen/decos-zaken';
import { componentCreator } from '../../MockApp';

const mocks = vi.hoisted(() => {
  return {
    DetailComponent({ vergunning }: { vergunning: DecosZaakFrontend }) {
      return <span>{vergunning.caseType}</span>;
    },
  };
});

// Mock all the React component dependencies
vi.mock('./detail-page-content/AanbiedenDienstenEnStraatartiesten', () => ({
  AanbiedenDienstenEnStraatartiestenContent: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/ERVV', () => ({
  ERVV: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/EvenementMelding', () => ({
  EvenementMelding: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/EvenementVergunning', () => ({
  EvenementVergunning: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/Flyeren', () => ({
  Flyeren: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/Nachtwerkontheffing', () => ({
  Nachtwerkontheffing: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/Omzettingsvergunning', () => ({
  Omzettingsvergunning: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/RvvHeleStad', () => ({
  RvvHeleStad: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/RvvSloterweg', () => ({
  RvvSloterweg: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/TVMRVVObject', () => ({
  TVMRVVObject: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/VOB', () => ({
  VOB: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/Woonvergunningen', () => ({
  Woonvergunningen: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/ZwaarVerkeer', () => ({
  ZwaarVerkeer: mocks.DetailComponent,
}));
vi.mock('./detail-page-content/WVOS', () => ({
  WVOSContent: mocks.DetailComponent,
}));

// Mock hooks
vi.mock('./useVergunningenThemaData.hook', () => ({
  useVergunningenThemaData: vi.fn(),
}));
vi.mock('./useVergunningenDetailData.hook', () => ({
  useVergunningenDetailData: vi.fn(),
}));

describe('VergunningDetailPagina', () => {
  it('should render the correct component based on caseType', () => {
    const mockVergunning = { caseType: 'TVM - RVV - Object' };
    const createVergunning = componentCreator({
      component: VergunningenDetail,
      routeEntry: `/vergunningen/tvm-rvv-object/1`,
      routePath: '/vergunningen/:caseType/:id',
    });
    const Vergunning = createVergunning({});

    (useVergunningenThemaData as Mock).mockReturnValue({
      vergunningen: [],
      isLoading: false,
      isError: false,
      breadcrumbs: [],
      routeConfig: {
        detailPage: {
          path: '/vergunningen/:caseType/:id',
        },
      },
    });
    (useVergunningenDetailData as Mock).mockReturnValue({
      vergunning: mockVergunning,
      title: 'Test Title',
      documents: [],
      isLoadingDocuments: false,
      isErrorDocuments: false,
    });

    render(<Vergunning />);

    expect(screen.getByText('TVM - RVV - Object')).toBeInTheDocument();
  });

  it('should render the default Datalist for unknown caseType', () => {
    const mockVergunning = { caseType: 'Unknown Case', key: 'value' };
    const createVergunning = componentCreator({
      component: VergunningenDetail,
      routeEntry: `/vergunningen/tvm-rvv-object/1`,
      routePath: '/vergunningen/:caseType/:id',
    });
    const Vergunning = createVergunning({});
    (useVergunningenThemaData as Mock).mockReturnValue({
      vergunningen: [],
      isLoading: false,
      isError: false,
      routeConfig: {
        detailPage: {
          path: '/vergunningen/:caseType/:id',
        },
      },
      breadcrumbs: [
        {
          to: '/vergunningen',
          title: 'Vergunningen - thema',
        },
      ],
    });
    (useVergunningenDetailData as Mock).mockReturnValue({
      vergunning: mockVergunning,
      title: 'Test Title',
      documents: [
        {
          id: 'x1',
          title: 'Document 1',
          url: 'https://example.com/document1.pdf',
          datePublished: '2023-01-01',
        },
      ],
      isLoadingDocuments: false,
      isErrorDocuments: false,
    });

    render(<Vergunning />);

    expect(screen.getByText('caseType')).toBeInTheDocument();
    expect(screen.getByText('"Unknown Case"')).toBeInTheDocument();
    expect(screen.getByText('key')).toBeInTheDocument();
    expect(screen.getByText('"value"')).toBeInTheDocument();

    const documentLink = screen.getByRole('link', { name: 'Document 1' });
    expect(documentLink).toBeInTheDocument();

    expect(documentLink).toHaveAttribute(
      'href',
      'https://example.com/document1.pdf'
    );

    expect(screen.getByText('01 januari 2023')).toBeInTheDocument();
    const breadcrumbLink = screen.getByRole('link', {
      name: 'Vergunningen - thema',
    });
    expect(breadcrumbLink).toBeInTheDocument();
    expect(breadcrumbLink).toHaveAttribute('href', '/vergunningen');
  });
});

describe('DetailPageContent', () => {
  const { DetailPageContent } = forTesting;

  const caseTypes = Object.keys(decosCaseToZaakTransformers);

  test.each(caseTypes)(
    'should render the correct component for caseType "%s"',
    (caseType) => {
      const mockVergunning = {
        caseType,
      } as DecosZaakFrontend<DecosVergunning>;

      render(<DetailPageContent vergunning={mockVergunning} />);

      expect(screen.getByText(caseType)).toBeInTheDocument();
    }
  );

  it('should render the default Datalist for an unknown caseType', () => {
    const mockVergunning = {
      caseType: 'Unknown Case',
      key: 'value',
    } as unknown as DecosZaakFrontend<DecosVergunning>;

    render(<DetailPageContent vergunning={mockVergunning} />);

    expect(screen.getByText('caseType')).toBeInTheDocument();
    expect(screen.getByText('"Unknown Case"')).toBeInTheDocument();
    expect(screen.getByText('key')).toBeInTheDocument();
    expect(screen.getByText('"value"')).toBeInTheDocument();
  });
});
