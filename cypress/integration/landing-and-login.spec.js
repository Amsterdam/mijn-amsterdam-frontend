import { assertAtHome, selectComponent } from '../support/helpers';

describe('Landing page and login', () => {
  function atHome() {
    assertAtHome('Welkom op Mijn Amsterdam');
  }

  it('Visit logout url always returns to landing page', () => {
    cy.visit('/logout');
    atHome();
  });

  it('Login button can be clicked, user is redirected to dashboard', () => {
    cy.contains('Inloggen met DigiD').click();
    cy.location('pathname').should('eq', '/');
    cy.contains('Actueel');
  });

  it('Clicking logout button sends us back to the landing page', () => {
    cy.contains('Uitloggen').click();
    atHome();
  });
});
