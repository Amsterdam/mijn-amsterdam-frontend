import { selectComponent, assertAtPage } from '../support/helpers';

describe('Profile page', function() {
  it('The profile link is visible in the header', function() {
    cy.login();
    selectComponent('MainNavBar_ProfileLink').contains('Wesley Beemsterboer');
  });

  it('Clicking the profile link in the header shows the profile page', function() {
    selectComponent('MainNavBar_ProfileLink').click();
    assertAtPage('Mijn gegevens', '/persoonlijke-gegevens');
  });

  it('Shows profile data', function() {
    const headings = cy.get(
      '[class*="InfoPanel_InfoPanel"] [class*="Heading_Heading"]'
    );
    headings.should('exist').should('have.length', 3);
  });
});
