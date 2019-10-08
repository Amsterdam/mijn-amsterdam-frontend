export function getPageHeading() {
  return selectComponent('PageHeading_PageHeading').eq(0);
}
export function assertAtHome(headingString) {
  cy.location('pathname').should('eq', '/');
  getPageHeading().contains(headingString);
}
export function selectComponent(componentName) {
  return cy.get('[class*="' + componentName + '"]');
}
