import {
  goToDashboard,
  selectComponent,
  assertPath,
  assertAtPage,
} from '../support/helpers';

describe('Chapter: Inkomen en Stadspas', () => {
  goToDashboard();

  it('should navigate to the overview page', () => {
    cy.get(
      '[class*="MyChaptersPanel_Links"] a[data-chapter-id="INKOMEN"]'
    ).click();
    assertAtPage('Inkomen en Stadspas', '/inkomen-en-stadspas');
  });

  it('should display lists', () => {
    selectComponent('SectionCollapsible_SectionCollapsible').should(
      'have.length',
      4
    );
    selectComponent('SectionCollapsible_SectionCollapsible', ':first').should(
      'contain',
      'Lopende aanvragen'
    );
    selectComponent('SectionCollapsible_SectionCollapsible', ':eq(1)').should(
      'contain',
      'Afgehandelde aanvragen'
    );
  });

  it('Should expand/collapse the list by clicking on the title', () => {
    selectComponent('SectionCollapsible_isCollapsed').should('have.length', 3);

    // Collapse first list
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':first button:first'
    ).click();

    // We now have 3 collapsed lists
    selectComponent('SectionCollapsible_isCollapsed').should('have.length', 4);

    // Expand the list again
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':first button:first'
    ).click();
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

  it('Should navigate to a detail page and show all the (completed) steps of a request', () => {
    // Expand the second list
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':eq(1) button:first'
    ).click();

    // Click the first item of the jsut expanded list
    cy.get('a[href*="inkomen-en-stadspas/stadspas/0-2"]').click();

    selectComponent('StatusLine_MoreStatus').should('have.length', 2);
    selectComponent('StatusLine_StatusLine').should('exist');
    selectComponent('StatusLine_LastActive').should('exist');
    selectComponent('StatusLine_ListItem__', ':visible').should(
      'have.length',
      1
    );
    selectComponent('StatusLine_MoreStatus', ':first').click();
    selectComponent('StatusLine_ListItem__', ':visible').should(
      'have.length',
      3
    );
    selectComponent('StatusLine_MoreStatus', ':eq(1)').click();
    selectComponent('StatusLine_ListItem__', ':visible').should(
      'have.length',
      1
    );

    // Go back
    selectComponent('PageHeading_BackLink').click();
    assertAtPage('Inkomen en Stadspas', '/inkomen-en-stadspas');

    // Collapse the second list
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':eq(1) button:first'
    ).click();
  });

  it('Should be able to navigate to a detail page', () => {
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':eq(1) tbody tr a:first'
    ).click();
  });

  it('Should display the title and a link to go back', () => {
    cy.get('h2:first').should('exist');
    cy.get('header')
      .get('a')
      .contains('Inkomen en Stadspas')
      .should('exist');
  });

  it('Should show all the steps of the status line', () => {
    cy.get('button')
      .contains('Toon alles')
      .click();
  });

  it('Should have a few document downloads attached', () => {
    cy.get('ul li ul li')
      .contains('a')
      .invoke('attr', 'download')
      .should('exist');
  });
});
