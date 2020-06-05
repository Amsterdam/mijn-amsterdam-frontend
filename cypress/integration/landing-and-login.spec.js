import { assertAtHome, itShouldLogout } from '../support/helpers';

describe('Landing page and login', () => {
  itShouldLogout();

  it('Login button can be clicked, user is redirected to dashboard', () => {
    cy.contains('Inloggen met DigiD').click();
    assertAtHome('Actueel');
  });

  itShouldLogout();
});
