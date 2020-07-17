import {
  itShouldLogoutAndInAgain,
  selectComponent,
  assertAtPage,
} from '../support/helpers';

describe('Chapter: Inkomen en Stadspas', () => {
  itShouldLogoutAndInAgain();

  it('should navigate to the overview page', () => {
    cy.get(
      '[class*="MyChaptersPanel_Links"] a[data-chapter-id="INKOMEN"]'
    ).click();
    assertAtPage('Inkomen en Stadspas', '/inkomen-en-stadspas');
  });

  it('should display lists', () => {
    selectComponent('SectionCollapsible_SectionCollapsible', ':first').should(
      'contain',
      'Lopende aanvragen'
    );
    selectComponent('SectionCollapsible_SectionCollapsible', ':eq(1)').should(
      'contain',
      'Eerdere aanvragen'
    );
  });

  it('Should navigate between a detail page and overviewpage', () => {
    // Click first item of expanded list
    cy.get(
      '[class*="SectionCollapsible_SectionCollapsible"]:first [class*="Table_DisplayPropTitle"]:first > '
    ).click();

    // Go back
    selectComponent('PageHeading_BackLink').click();

    assertAtPage('Inkomen en Stadspas', '/inkomen-en-stadspas');
  });

  it('Should display the title and a link to go back', () => {
    cy.get('h2:first').should('exist');
    cy.get('header')
      .get('a')
      .contains('Inkomen en Stadspas')
      .should('exist');
  });
});
