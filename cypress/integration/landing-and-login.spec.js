import { assertAtHome } from '../support/helpers';

describe('Landing page and login', function() {
  function atHome() {
    assertAtHome('Welkom op Mijn Amsterdam');
  }

  it('Visit logout url always returns to landing page', function() {
    cy.request('http://localhost:5000/api/logout');
    cy.visit('/');
    atHome();
  });

  it('Login button can be clicked, user is redirected to dashboard', function() {
    cy.contains('Inloggen met DigiD').click();
    cy.location('pathname').should('eq', '/');
    cy.contains('Actueel');
  });

  it('Clicking logout button sends us back to the landing page', function() {
    cy.contains('Uitloggen').click();
    atHome();
  });
});
