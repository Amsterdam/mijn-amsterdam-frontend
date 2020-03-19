import { selectComponent, assertAtPage, login } from '../support/helpers';

describe('Profile page', () => {
  login();

  it('Clicking the profile link in the header shows the profile page', () => {
    selectComponent('MainNavBar_ProfileLink').click();
    assertAtPage('Persoonsgegevens', '/persoonlijke-gegevens');
  });

  it('Shows profile data', () => {
    const headings = cy.get(
      '[class*="InfoPanel_InfoPanel"] [class*="Heading_Heading"]'
    );
    headings.should('exist').should('have.length', 7);
  });
});
