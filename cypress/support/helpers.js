export function getPageHeading() {
  return selectComponent('PageContentMainHeading_PageContentMainHeading').eq(0);
}
export function assertAtHome(headingString) {
  cy.location('pathname').should('eq', '/');
  getPageHeading().contains(headingString);
}
export function selectComponent(componentName) {
  return cy.get('[class*="' + componentName + '"]');
}
