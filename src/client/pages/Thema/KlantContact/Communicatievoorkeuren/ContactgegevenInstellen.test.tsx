import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { generatePath, MemoryRouter, Route, Routes } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { ContactgegevenInstellen } from './ContactgegevenInstellen.tsx';
import type { KlantcontactResponseData } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { bffApi } from '../../../../../testing/utils.ts';
import type { ApiResponse } from '../../../../../universal/helpers/api.ts';
import { useAppStateStore } from '../../../../hooks/useAppStateStore.ts';
import { themaConfig } from '../KlantContact-thema-config.ts';

function setBaseState() {
  useAppStateStore.setState({
    KLANT_CONTACT: {
      status: 'OK',
      content: {
        afspraken: [],
        contactmomenten: [],
        communicatievoorkeuren: {
          standaardContactgegevens: {
            Email: {
              id: null,
              type: 'Email',
              value: null,
              dateModified: null,
              dateModifiedFormatted: null,
              isVerified: false,
            },
          },
          aangeslotenDiensten: [],
        },
      },
    } as unknown as ApiResponse<KlantcontactResponseData>,
  });
}

function renderWithRoute(routeEntry: string) {
  return render(
    <MemoryRouter initialEntries={[routeEntry]}>
      <Routes>
        <Route
          path={themaConfig.detailPageContactgegevenInstellen.route.path}
          element={<ContactgegevenInstellen />}
        />
        <Route
          path={themaConfig.route.path}
          element={<div>KlantContact Home</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ContactgegevenInstellen integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    setBaseState();
  });

  it('shows NotFound for unknown contactgegeven type', async () => {
    const routeEntry = generatePath(
      themaConfig.detailPageContactgegevenInstellen.route.path,
      {
        contactgegeven: 'OnbekendType',
        step: '1',
      }
    );

    renderWithRoute(routeEntry);

    expect(
      screen.getByRole('heading', { name: 'Pagina niet gevonden' })
    ).toBeInTheDocument();
  });

  it('submits step 1 and navigates to step 2 when create succeeds', async () => {
    const user = userEvent.setup();
    const routeEntry = generatePath(
      themaConfig.detailPageContactgegevenInstellen.route.path,
      {
        contactgegeven: 'Email',
        step: '1',
      }
    );

    const createScope = bffApi
      .post('/services/klantcontact/contactgegeven/create')
      .reply(200, {
        status: 'OK',
        content: {
          id: 'email-1',
          type: 'Email',
          value: 'test@example.com',
          isVerified: false,
        },
      });

    renderWithRoute(routeEntry);

    const valueInput = screen.getByPlaceholderText(
      /Vul hier uw E-mailadres in/i
    );

    await user.clear(valueInput);
    await user.type(valueInput, 'test@example.com');
    await user.click(screen.getByRole('button', { name: 'Versturen' }));

    await waitFor(() => {
      expect(createScope.isDone()).toBe(true);
    });

    expect(await screen.findByText('Vul de code in')).toBeInTheDocument();
    expect(
      await screen.findByText(
        /Wij hebben een code met 6 cijfers gestuurd naar/i
      )
    ).toBeInTheDocument();
  });

  it('shows validation error for invalid email and stays on step 1', async () => {
    const user = userEvent.setup();
    const routeEntry = generatePath(
      themaConfig.detailPageContactgegevenInstellen.route.path,
      {
        contactgegeven: 'Email',
        step: '1',
      }
    );

    renderWithRoute(routeEntry);

    const valueInput = screen.getByPlaceholderText(
      /Vul hier uw E-mailadres in/i
    );

    await user.type(valueInput, 'invalid-email');
    await user.click(screen.getByRole('button', { name: 'Versturen' }));

    expect(
      screen.getByText('Dit lijkt geen valide E-mailadres.')
    ).toBeInTheDocument();
    expect(screen.queryByText('Vul de code in')).not.toBeInTheDocument();
  });

  it('verifies code on step 2 and navigates back to the thema route', async () => {
    const user = userEvent.setup();
    const routeEntry = generatePath(
      themaConfig.detailPageContactgegevenInstellen.route.path,
      {
        contactgegeven: 'Email',
        step: '2',
      }
    );

    sessionStorage.setItem(
      'standaard-Email-voorkeur-instellen',
      JSON.stringify('test@example.com')
    );

    bffApi.post('/services/klantcontact/contactgegeven/verify').reply(200, {
      status: 'OK',
      content: { verified: true },
    });

    // OTP input can trigger submit twice in some environments (on complete + submit).
    bffApi.post('/services/klantcontact/contactgegeven/verify').reply(200, {
      status: 'OK',
      content: { verified: true },
    });

    renderWithRoute(routeEntry);

    const otpInputs = screen.getAllByRole('textbox');
    expect(otpInputs).toHaveLength(6);

    for (let i = 0; i < otpInputs.length; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }

    expect(await screen.findByText('KlantContact Home')).toBeInTheDocument();
  });

  it('shows API error when verify request fails and stays on step 2', async () => {
    const user = userEvent.setup();
    const routeEntry = generatePath(
      themaConfig.detailPageContactgegevenInstellen.route.path,
      {
        contactgegeven: 'Email',
        step: '2',
      }
    );

    sessionStorage.setItem(
      'standaard-Email-voorkeur-instellen',
      JSON.stringify('test@example.com')
    );

    bffApi.post('/services/klantcontact/contactgegeven/verify').reply(500, {
      status: 'ERROR',
      message: 'verify failed',
      content: null,
    });

    bffApi.post('/services/klantcontact/contactgegeven/verify').reply(500, {
      status: 'ERROR',
      message: 'verify failed',
      content: null,
    });

    renderWithRoute(routeEntry);

    const otpInputs = screen.getAllByRole('textbox');
    for (let i = 0; i < otpInputs.length; i++) {
      await user.type(otpInputs[i], String(i + 1));
    }

    expect(
      await screen.findByText(
        /Er is een fout opgetreden bij het checken van de code\./i
      )
    ).toBeInTheDocument();
    expect(screen.queryByText('KlantContact Home')).not.toBeInTheDocument();
  });
});
