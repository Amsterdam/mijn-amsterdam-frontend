export function getPageHeading() {
  return selectComponent('PageHeading_PageHeading').eq(0);
}

export function assertPath(pathname) {
  cy.location('pathname').should('eq', pathname);
}

export function assertAtPage(headingString, pathname) {
  assertPath(pathname);
  getPageHeading().contains(headingString);
}

export function assertAtHome(headingString) {
  assertAtPage(headingString, '/');
}

export function selectComponent(componentName, selectorAddition = '') {
  return cy.get('[class*="' + componentName + '"]' + selectorAddition + '');
}

export function itShouldLogin() {
  it('Visit login url always shows the dashboard', () => {
    cy.visit('/test-api/login?target=digid');
    assertAtHome('Actueel');
  });
}

export function itShouldLogout() {
  it('Visit logout url always returns to landing page', () => {
    cy.visit('/logout');
    assertAtHome('Welkom op Mijn Amsterdam');
  });
}

export function itShouldLogoutAndInAgain() {
  itShouldLogout();
  itShouldLogin();
}
