import { itShouldLogoutAndInAgain, assertAtPage } from '../support/helpers';

function getChapterLink() {
  return cy.get('[class*="MyChaptersPanel_Links"] a[data-chapter-id=AFVAL]');
}

describe('Garbage page', () => {
  itShouldLogoutAndInAgain();

  it('Shows garbage chapter', () => {
    getChapterLink().should('exist');
  });

  it('Navigates to Garbage page', () => {
    getChapterLink().click();
    assertAtPage('Afval', '/afval');
  });

  it('Shows my address', () => {
    cy.get('[class*=AddressPanel]').should('exist');
  });

  describe('Should show 4 headings', () => {
    [
      'Grofvuil',
      'Restafval',
      'Afvalcontainers in de buurt',
      'Afvalpunten',
    ].forEach(h => {
      it(`The heading ${h} should exist`, () => {
        cy.get('[class*=SectionCollapsible_Title]').contains(h);
      });
      it('Should toggle the collapsible', () => {
        cy.get('[class*=SectionCollapsible_Title] button')
          .contains(h)
          .click();
      });
      it('Should expand the content', () => {
        cy.get('[class*=SectionCollapsible_Title]')
          .contains(h)
          .parent()
          .next()
          .invoke('attr', 'aria-hidden')
          .should('contain', 'false');
      });
    });
  });
});
