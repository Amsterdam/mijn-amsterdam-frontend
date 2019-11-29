import {
  goToDashboard,
  selectComponent,
  assertPath,
  assertAtPage,
} from '../support/helpers';

describe('Chapter: Werk en inkomen', () => {
  goToDashboard();

  it('should navigate to the overview page', () => {
    cy.get(
      '[class*="MyChaptersPanel_Links"] a[data-chapter-id="INKOMEN"]'
    ).click();
    assertAtPage('Werk en inkomen', '/werk-en-inkomen');
  });

  it('should display 2 lists', () => {
    selectComponent('SectionCollapsible_SectionCollapsible').should(
      'have.length',
      2
    );
    selectComponent('SectionCollapsible_SectionCollapsible', ':first').should(
      'contain',
      'Mijn lopende aanvragen'
    );
    selectComponent('SectionCollapsible_SectionCollapsible', ':eq(1)').should(
      'contain',
      'Mijn besluiten'
    );
  });

  it('Should expand/collapse the list by clicking on the title', () => {
    selectComponent('SectionCollapsible_isCollapsed').should('have.length', 1);

    // Collapse first list
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':first button:first'
    ).click();

    // We now have 2 collapsed lists
    selectComponent('SectionCollapsible_isCollapsed').should('have.length', 2);

    // Expand the list again
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':first button:first'
    ).click();
  });

  it('Should navigate between a detail page and overviewpage', () => {
    // Click first item of expanded list
    cy.get(
      '[class*="SectionCollapsible_SectionCollapsible"]:first [class*="DataLinkTable_DisplayPropTitle"]:first > a'
    ).click();

    assertPath('/werk-en-inkomen/stadspas/0-0');

    // Go back
    selectComponent('PageHeading_BackLink').click();

    assertAtPage('Werk en inkomen', '/werk-en-inkomen');
  });

  it('Should navigate to a detail page and show all the (completed) steps of a request', () => {
    // Expand the second list
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':eq(1) button:first'
    ).click();

    // Click the first item of the jsut expanded list
    cy.get(
      '[class*="SectionCollapsible_SectionCollapsible"]:eq(1) [class*="DataLinkTable_DisplayPropTitle"]:first > a'
    ).click();

    assertAtPage(
      'Bijstandsuitkering',
      '/werk-en-inkomen/bijstandsuitkering/1-0'
    );

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
    assertAtPage('Werk en inkomen', '/werk-en-inkomen');

    // Collapse the second list
    selectComponent(
      'SectionCollapsible_SectionCollapsible',
      ':eq(1) button:first'
    ).click();
  });
});
