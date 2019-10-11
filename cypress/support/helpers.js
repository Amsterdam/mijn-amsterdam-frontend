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

export function selectComponent(componentName) {
  return cy.get('[class*="' + componentName + '"]');
}
