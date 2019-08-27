describe('Landing page and login', function() {
  const LOGIN_BTN_TEXT = 'Inloggen met DigiD';
  const USERNAME = 'Ann Michelle Johanna Janssen';
  const URL = 'http://localhost:3000/';
  const LOGIN_URL = 'localhost:3000/api/login';
  const LOGOUT_URL = 'localhost:3000/api/logout';

  // it('shows login button', function() {
  //   // Make sure the user is in an logged out state
  //   cy.request(LOGOUT_URL);
  //   cy.visit(URL);
  //   cy.contains(LOGIN_BTN_TEXT);
  // });

  it('redirects to the dashboard when logged in', function() {
    cy.request(LOGIN_URL);
    // cy.visit(URL);
    cy.url().should('eq', URL);
  });
});
