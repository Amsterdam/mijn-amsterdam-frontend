import { assertAtHome } from '../support/helpers';

describe('Landing page and login', () => {
  function atLanding() {
    assertAtHome('Welkom op Mijn Amsterdam');
  }

  it('Visit logout url always returns to landing page', () => {
    cy.visit('/logout');
    atLanding();
  });

  it('Login button can be clicked, user is redirected to dashboard', () => {
    cy.contains('Inloggen met DigiD').click();
    assertAtHome('Actueel');
  });

  it('Clicking logout button sends us back to the landing page', () => {
    cy.contains('Uitloggen').click();
    atLanding();
  });
});
