import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Steps } from './StatusSteps.tsx';
import { defaultDateFormat } from '../../../universal/helpers/date.ts';
import type { StatusLineItem } from '../../../universal/types/App.types.ts';

function createStep(overrides: Partial<StatusLineItem> = {}): StatusLineItem {
  return {
    id: `step-${Math.random().toString(36).slice(2)}`,
    status: 'In behandeling',
    datePublished: '2026-07-01T10:00:00.000Z',
    isActive: false,
    isChecked: false,
    ...overrides,
  };
}

describe('Steps', () => {
  it('renders only visible steps and visible substeps', () => {
    const steps: StatusLineItem[] = [
      createStep({ id: 'step-1', status: 'Ontvangen', isVisible: true }),
      createStep({ id: 'step-2', status: 'Verborgen', isVisible: false }),
      createStep({
        id: 'step-3',
        status: 'Met substeps',
        substeps: [
          createStep({ id: 'sub-1', status: 'Sub zichtbaar', isVisible: true }),
          createStep({
            id: 'sub-2',
            status: 'Sub verborgen',
            isVisible: false,
          }),
        ],
      }),
    ];

    render(<Steps steps={steps} title="Mijn stappen" />);

    expect(
      screen.getByRole('heading', { name: 'Mijn stappen' })
    ).toBeInTheDocument();
    expect(screen.getByText('Ontvangen')).toBeInTheDocument();
    expect(screen.queryByText('Verborgen')).not.toBeInTheDocument();
    expect(screen.getByText('Met substeps')).toBeInTheDocument();
    expect(screen.getByText('Sub zichtbaar')).toBeInTheDocument();
    expect(screen.queryByText('Sub verborgen')).not.toBeInTheDocument();
  });

  it('maps active and checked flags to aria labels and statuses', () => {
    const completed = createStep({
      id: 'completed',
      status: 'Afgerond',
      isChecked: true,
      isActive: false,
    });
    const current = createStep({
      id: 'current',
      status: 'Nu bezig',
      isChecked: false,
      isActive: true,
    });
    const future = createStep({
      id: 'future',
      status: 'Nog niet gestart',
      isChecked: false,
      isActive: false,
    });

    render(<Steps steps={[completed, current, future]} />);

    expect(screen.getByLabelText('Status Afgerond')).toBeInTheDocument();
    expect(screen.getByLabelText('Huidige status')).toBeInTheDocument();
    expect(screen.getByLabelText('Toekomstige status')).toBeInTheDocument();
  });

  it('renders description and string alt document content via parseHTML and shows documents', () => {
    const step = createStep({
      id: 'step-with-content',
      status: 'Met content',
      description: '<p>Beschrijving</p>',
      altDocumentContent: '<p>Alternatieve documenten</p>',
      documents: [
        {
          id: 'doc-1',
          title: 'Bijlage 1',
          url: '/doc-1',
          datePublished: '2026-07-01T10:00:00.000Z',
        },
      ],
    });

    render(<Steps steps={[step]} />);

    expect(
      screen.getByText(defaultDateFormat(step.datePublished))
    ).toBeInTheDocument();
    expect(screen.getByText('Beschrijving')).toBeInTheDocument();
    expect(screen.getByText('Alternatieve documenten')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Bijlage 1' })).toHaveAttribute(
      'href',
      '/doc-1'
    );
  });

  it('renders node alt document content directly', () => {
    const step = createStep({
      id: 'step-node-alt-content',
      altDocumentContent: <span>Custom content node</span>,
    });

    render(<Steps steps={[step]} />);

    expect(screen.getByText('Custom content node')).toBeInTheDocument();
  });

  it('renders action button items as links', () => {
    const step = createStep({
      id: 'step-action-buttons',
      description: '<p>Beschrijving met acties</p>',
      actionButtonItems: [
        { to: '/actie-1', title: 'Actie 1' },
        { to: '/actie-2', title: 'Actie 2' },
      ],
    });

    render(<Steps steps={[step]} />);

    expect(screen.getByRole('link', { name: 'Actie 1' })).toHaveAttribute(
      'href',
      '/actie-1'
    );
    expect(screen.getByRole('link', { name: 'Actie 2' })).toHaveAttribute(
      'href',
      '/actie-2'
    );
  });

  it('shows substep heading by default and can hide it', () => {
    const steps: StatusLineItem[] = [
      createStep({
        id: 'step-with-substep',
        status: 'Hoofdstap',
        substeps: [
          createStep({
            id: 'substep-with-heading',
            status: 'Unieke substep titel',
            isVisible: true,
          }),
        ],
      }),
    ];

    const { rerender } = render(<Steps steps={steps} />);
    expect(
      screen.getByRole('heading', { name: 'Unieke substep titel' })
    ).toBeInTheDocument();

    rerender(<Steps steps={steps} showSubstepHeading={false} />);
    expect(
      screen.queryByRole('heading', { name: 'Unieke substep titel' })
    ).not.toBeInTheDocument();
  });
});
