import {
  selectComponent,
  assertAtPage,
  itShouldLogin,
} from '../support/helpers';

describe('Profile page', () => {
  itShouldLogin();

  it('Clicking the profile link in the header shows the profile page', () => {
    selectComponent('MyChaptersPanel_Links')
      .find('a[href*="/persoonlijke-gegevens"]:eq(0)')
      .click();
    assertAtPage('Mijn gegevens', '/persoonlijke-gegevens');
  });

  it('Shows profile data', () => {
    const headings = cy.get(
      '[class*="InfoPanel_InfoPanel"] [class*="Heading_Heading"]'
    );
    headings.should('exist').should('have.length', 7);
  });
});
