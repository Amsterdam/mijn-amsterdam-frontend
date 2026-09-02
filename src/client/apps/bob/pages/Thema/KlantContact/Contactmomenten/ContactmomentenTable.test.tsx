import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ContactMomenten } from './ContactmomentenTable.tsx';
import { MockApp } from '../../../MockApp.tsx';
import type { ContactmomentFrontendFinal } from '../KlantContact-thema-config.ts';

describe('ContactMomenten', () => {
  it('matches snapshot', () => {
    const contactmomenten: ContactmomentFrontendFinal[] = [
      {
        datePublished: '2026-07-01T09:30:00Z',
        datePublishedFormatted: '1 juli 2026',
        subject: 'Vraag over verhuizing',
        referenceNumber: 'CM-12345',
        kanaal: 'Telefoon',
        kanaalEl: 'Telefoon',
        subjectLink: (
          <a href="/mijn-contact/contactmomenten/CM-12345">
            Vraag over verhuizing
          </a>
        ),
        className: 'contactmoment-row',
      },
    ];

    const { asFragment } = render(
      <MockApp
        component={() => <ContactMomenten contactmomenten={contactmomenten} />}
      />
    );

    expect(asFragment()).toMatchSnapshot();
  });
});
