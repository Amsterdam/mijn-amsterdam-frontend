import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { CommunicatieVoorkeuren } from './CommunicatieVoorkeuren.tsx';
import type { ContactgegevenPerTypeFrontend } from '../../../../../server/services/klantcontact/klantcontact-profieldienst-types.ts';
import type { KlantcontactResponseData } from '../../../../../server/services/klantcontact/klantcontact.types.ts';
import { bffApi } from '../../../../../testing/utils.ts';
import type { ApiResponse } from '../../../../../universal/helpers/api.ts';
import { useAppStateStore } from '../../../../hooks/useAppStateStore.ts';

function getStandaardContactgegevens(emailOverrides?: {
  id?: string | null;
  value?: string | null;
  isVerified?: boolean;
  dateModified?: string | null;
  dateModifiedFormatted?: string | null;
}) {
  return {
    Email: {
      id: emailOverrides?.id ?? 'email-1',
      type: 'Email',
      value: emailOverrides?.value ?? 'test@example.com',
      isVerified: emailOverrides?.isVerified ?? true,
      dateModified: emailOverrides?.dateModified ?? '2026-06-01T10:00:00.000Z',
      dateModifiedFormatted:
        emailOverrides?.dateModifiedFormatted ?? '1 juni 2026',
    },
  } as unknown as ContactgegevenPerTypeFrontend;
}

describe('CommunicatieVoorkeuren integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAppStateStore.setState({
      KLANT_CONTACT: {
        content: {
          communicatievoorkeuren: {
            standaardContactgegevens: {},
          },
        },
      } as ApiResponse<KlantcontactResponseData>,
    });
  });

  it('shows acceptance alert when user enables email post checkbox', async () => {
    const user = userEvent.setup();

    render(
      <CommunicatieVoorkeuren
        standaardContactgegevens={getStandaardContactgegevens()}
        aangeslotenDiensten={[{ id: 'dienst-1', beschrijving: 'Belastingen' }]}
      />
    );

    const checkbox = screen.getByRole('checkbox', {
      name: 'Ja, ik wil post per e-mail ontvangen van de gemeente Amsterdam.',
    });

    expect(
      screen.queryByText('Post per e-mail geaccepteerd')
    ).not.toBeInTheDocument();

    await user.click(checkbox);

    expect(
      screen.getByText('Post per e-mail geaccepteerd')
    ).toBeInTheDocument();
    expect(
      screen
        .getByRole('heading', { name: 'Post per e-mail geaccepteerd' })
        .closest('section')
    ).toHaveTextContent(
      'U ontvangt nu post van de gemeente Amsterdam per e-mail op'
    );
  });

  it('sends delete network call when user confirms verwijderen', async () => {
    const user = userEvent.setup();

    const deleteScope = bffApi
      .post('/services/klantcontact/contactgegeven/delete', /id=email-1/)
      .reply(200, {
        status: 'OK',
        content: null,
      });

    render(
      <CommunicatieVoorkeuren
        standaardContactgegevens={getStandaardContactgegevens()}
        aangeslotenDiensten={[]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Verwijderen' }));

    expect(
      screen.getByRole('heading', { name: 'E-mailadres verwijderen' })
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Ja, verwijderen' }));

    await waitFor(() => {
      expect(deleteScope.isDone()).toBe(true);
    });
  });

  it('shows error feedback when delete network call fails', async () => {
    const user = userEvent.setup();

    const deleteScope = bffApi
      .post('/services/klantcontact/contactgegeven/delete', /id=email-1/)
      .reply(500, {
        status: 'ERROR',
        message: 'Delete failed',
        content: null,
      });

    render(
      <CommunicatieVoorkeuren
        standaardContactgegevens={getStandaardContactgegevens()}
        aangeslotenDiensten={[]}
      />
    );

    await user.click(screen.getByRole('button', { name: 'Verwijderen' }));
    await user.click(screen.getByRole('button', { name: 'Ja, verwijderen' }));

    await waitFor(() => {
      expect(deleteScope.isDone()).toBe(true);
      expect(screen.getByText('Verwijderen mislukt')).toBeInTheDocument();
    });

    expect(
      screen.getByText(
        'Er is iets misgegaan bij het verwijderen van dit e-mailadres. Probeer het later opnieuw.'
      )
    ).toBeInTheDocument();
  });
});
