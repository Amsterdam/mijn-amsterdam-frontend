import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router';

import { Afspraken } from './Afspraken.tsx';
import type { AfspraakFrontend } from '../../../../../server/services/klantcontact/klantcontact.types.ts';

function createAfspraak(index: number): AfspraakFrontend {
  return {
    cancellationLink: `https://example.org/cancel/${index}`,
    caseReference: `ref-${index}`,
    dateStartFormatted: '26 februari 2026',
    dateEndFormatted: '26 februari 2026',
    dateStart: `2026-02-26T0${index}:00:00Z`,
    dateEnd: `2026-02-26T0${index}:20:00Z`,
    displayDateTime: `26 februari 2026 van 1${index}:00 tot 1${index}:20 uur`,
    location: {
      city: 'Amsterdam',
      countryCode: 'NL',
      name: 'Centrum',
      postalCode: '1011 AB',
      street: 'Amstel 1',
    },
    qrCode: `qr-${index}`,
    status: 'New',
    subject: `Afspraak ${index}`,
    link: {
      to: `/afspraak/ref-${index}`,
      title: 'Bekijk afspraak',
    },
    icsLink: {
      to: `data:text/calendar;base64,ics-${index}`,
      title: 'Voeg toe aan agenda',
      download: `afspraak-ref-${index}.ics`,
    },
  };
}

describe('Afspraken', () => {
  test('shows loading state while afspraken are loading', () => {
    const screen = render(<Afspraken afspraken={[]} isLoading={true} />, {
      wrapper: BrowserRouter,
    });

    expect(
      screen.getByRole('heading', { name: 'Afspraken bij een Stadsloket' })
    ).toBeInTheDocument();
    expect(screen.getByText('Inhoud wordt opgehaald...')).toBeInTheDocument();
    expect(
      screen.queryByText('Er zijn geen afspraken bij het Stadsloket.')
    ).not.toBeInTheDocument();
  });

  test('shows empty state when there are no afspraken', () => {
    const screen = render(<Afspraken afspraken={[]} isLoading={false} />, {
      wrapper: BrowserRouter,
    });

    expect(
      screen.getByRole('heading', { name: 'Afspraken bij een Stadsloket' })
    ).toBeInTheDocument();
    expect(
      screen.getByText('Er zijn geen afspraken bij het Stadsloket.')
    ).toBeInTheDocument();
  });

  test('renders only maxAmountAfspraakDisplayed afspraken and shows link to list page', () => {
    const afspraken = [createAfspraak(1), createAfspraak(2), createAfspraak(3)];
    const screen = render(
      <Afspraken afspraken={afspraken} maxItems={2} isLoading={false} />,
      {
        wrapper: BrowserRouter,
      }
    );

    expect(screen.getByText('Afspraak 1')).toBeInTheDocument();
    expect(screen.getByText('Afspraak 2')).toBeInTheDocument();
    expect(screen.queryByText('Afspraak 3')).not.toBeInTheDocument();

    const listLink = screen.getByRole('link', {
      name: 'Bekijk uw 3 afspraken',
    });
    expect(listLink).toHaveAttribute('href', '/mijn-contact/afspraken');
  });

  test('renders amount of afspraken based on thema config', () => {
    const afspraken = [
      createAfspraak(1),
      createAfspraak(2),
      createAfspraak(3),
      createAfspraak(4),
    ];
    const screen = render(
      <Afspraken afspraken={afspraken} isLoading={false} />,
      {
        wrapper: BrowserRouter,
      }
    );

    expect(screen.getByText('Afspraak 1')).toBeInTheDocument();
    expect(screen.getByText('Afspraak 2')).toBeInTheDocument();
    expect(screen.queryByText('Afspraak 3')).toBeInTheDocument();
    expect(screen.queryByText('Afspraak 4')).not.toBeInTheDocument();

    const listLink = screen.getByRole('link', {
      name: 'Bekijk uw 4 afspraken',
    });
    expect(listLink).toHaveAttribute('href', '/mijn-contact/afspraken');
  });

  test('does not show link to list page when count is not above threshold', () => {
    const afspraken = [createAfspraak(1), createAfspraak(2)];
    const screen = render(
      <Afspraken afspraken={afspraken} maxItems={2} isLoading={false} />,
      {
        wrapper: BrowserRouter,
      }
    );

    expect(
      screen.queryByRole('link', {
        name: 'Al uw 2 afspraken bij een Stadsloket',
      })
    ).not.toBeInTheDocument();
  });

  test('does show link to list page when count is not above threshold, but compactmodus is true', () => {
    const afspraken = [createAfspraak(1)];
    const screen = render(
      <Afspraken
        afspraken={afspraken}
        maxItems={1}
        isLoading={false}
        compact={true}
      />,
      {
        wrapper: BrowserRouter,
      }
    );

    const listLink = screen.getByRole('link', {
      name: 'Bekijk uw 1 afspraak',
    });
    expect(listLink).toHaveAttribute('href', '/mijn-contact/afspraken');
  });
});
