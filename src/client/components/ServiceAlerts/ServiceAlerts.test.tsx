import { render, screen } from '@testing-library/react';

import type { ServiceAlert } from '../../../server/services/service-alerts/service-alerts.types.ts';
import { useServiceAlerts } from '../../hooks/api/useServiceAlerts.ts';
import { ServiceAlerts } from './ServiceAlerts.tsx';

vi.mock('../../hooks/api/useServiceAlerts.ts', () => ({
  useServiceAlerts: vi.fn(),
}));

function createServiceAlert(
  overrides: Partial<ServiceAlert> = {}
): ServiceAlert {
  return {
    id: 'alert-id',
    title: 'Storing',
    description: '<p>Er is een storing.</p>',
    datePublished: '2026-11-10T12:00:00.000Z',
    dateStart: '2026-11-10',
    dateEnd: '2026-11-11',
    timeStart: '12:00',
    timeEnd: '13:00',
    themaID: 'AVG',
    themaTitle: 'AVG',
    severity: 'warning',
    isAlert: true,
    displayLocation: 'theme',
    links: [],
    ...overrides,
  } as ServiceAlert;
}

describe('<ServiceAlerts />', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when there are no alerts', () => {
    vi.mocked(useServiceAlerts).mockReturnValue([]);

    const { container } = render(<ServiceAlerts />);

    expect(container).toBeEmptyDOMElement();
  });

  it('renders the title and description of an alert', () => {
    vi.mocked(useServiceAlerts).mockReturnValue([createServiceAlert()]);

    render(<ServiceAlerts />);

    expect(
      screen.getByRole('heading', { level: 4, name: 'Storing' })
    ).toBeInTheDocument();
    expect(screen.getByText('Er is een storing.')).toBeInTheDocument();
  });

  it('renders every link of an alert in the given order', () => {
    vi.mocked(useServiceAlerts).mockReturnValue([
      createServiceAlert({
        links: [
          { title: 'Eerste link', to: 'https://example.com/eerste' },
          { title: 'Tweede link', to: 'https://example.com/tweede' },
        ],
      }),
    ]);

    render(<ServiceAlerts />);

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.textContent)).toEqual([
      'Eerste link',
      'Tweede link',
    ]);
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      'https://example.com/eerste',
      'https://example.com/tweede',
    ]);
  });

  it('renders no links when the alert has none', () => {
    vi.mocked(useServiceAlerts).mockReturnValue([createServiceAlert()]);

    render(<ServiceAlerts />);

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('renders multiple alerts, each with its own links', () => {
    vi.mocked(useServiceAlerts).mockReturnValue([
      createServiceAlert({
        title: 'Eerste storing',
        links: [{ title: 'Link A', to: 'https://example.com/a' }],
      }),
      createServiceAlert({
        title: 'Tweede storing',
        links: [{ title: 'Link B', to: 'https://example.com/b' }],
      }),
    ]);

    render(<ServiceAlerts />);

    expect(screen.getAllByRole('heading', { level: 4 })).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Link A' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Link B' })).toBeInTheDocument();
  });

  it('passes page, themaID and fromApiDirectly to the hook', () => {
    vi.mocked(useServiceAlerts).mockReturnValue([]);

    render(<ServiceAlerts page="login" themaID="AVG" fromApiDirectly />);

    expect(useServiceAlerts).toHaveBeenCalledWith('login', 'AVG', true);
  });
});
