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

export function goToDashboard() {
  it('Visit login url always redirects user to Dashboard page', () => {
    cy.login();
  });
}

export function login() {
  it('The profile link is visible in the header', () => {
    cy.login();
    selectComponent('MainNavBar_ProfileLink').contains('W. Beemsterboer');
  });
}
