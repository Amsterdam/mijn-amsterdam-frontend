import {
  itShouldLogin,
  itShouldLogout,
  selectComponent,
} from '../support/helpers';

const pageConfig = {
  // Personalized pages
  BURGERZAKEN: {
    // hasCollapsiblePanels: true, // Only expanded initially at the moment
    pathname: '/burgerzaken',
  },
  BURGERZAKEN_DOCUMENT: {
    isDetailPage: true,
    pathname: '/burgerzaken/document/:id',
  },
  ZORG: {
    hasCollapsiblePanels: true,
    pathname: '/zorg-en-ondersteuning',
  },
  'ZORG/VOORZIENINGEN': {
    isDetailPage: true,
    pathname: '/zorg-en-ondersteuning/voorzieningen/:id',
  },
  INKOMEN: {
    hasCollapsiblePanels: true,
    pathname: '/inkomen-en-stadspas',
  },
  'INKOMEN/STADSPAS': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/stadspas/:id',
  },
  'INKOMEN/BIJSTANDSUITKERING': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/bijstandsuitkering/:id',
  },
  'INKOMEN/SPECIFICATIES': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/uitkeringsspecificaties/:type?',
  },
  'INKOMEN/TOZO': {
    isDetailPage: true,
    pathname: '/inkomen-en-stadspas/tozo/:id?',
  },
  BRP: {
    hasCollapsiblePanels: true,
    pathname: '/persoonlijke-gegevens',
  },
  AFVAL: {
    hasCollapsiblePanels: true,
    pathname: '/afval',
  },

  // Permanent non conditional pages
  BUURT: {
    isPermanentPage: true,
    pathname: '/buurt',
  },
  PROCLAIMER: {
    isPermanentPage: true,
    pathname: '/proclaimer',
  },
  TIPS: {
    isPermanentPage: true,
    pathname: '/overzicht-tips',
  },
  NOTIFICATIONS: {
    isPermanentPage: true,
    pathname: '/overzicht-updates',
  },
};

function expandCollapsiblePanels() {
  selectComponent('SectionCollapsible_SectionCollapsible')
    .find('[aria-expanded=false]')
    .click({ multiple: true });
  selectComponent('SectionCollapsible_SectionCollapsible')
    .find('[aria-expanded=false]')
    .should('not.exist');
  cy.wait(500);
}

describe('The happy path', () => {
  itShouldLogout();
  itShouldLogin();

  it('Should navigate to DASHBOARD', () => {
    cy.screenshot();
  });

  for (const [
    chapter,
    { pathname, isDetailPage, isPermanentPage, hasCollapsiblePanels },
  ] of Object.entries(pageConfig)) {
    it('Should navigate to ' + chapter, () => {
      // Always start from the dashboard
      cy.visit('/');

      // Wait for the logo to exist
      selectComponent('MainHeader_logo').should('exist');

      // Wait until loading has stopped
      selectComponent('LoadingContent_LoadingContent').should('not.exist');

      if (isPermanentPage) {
        // Click the first link to this page
        cy.get('a[href*="' + pathname + '"]:eq(0)').click();
        if (hasCollapsiblePanels) {
          expandCollapsiblePanels();
        }
      } else if (isDetailPage) {
        const [detailUrl] = pathname.split(':');
        const [, chapterUrl] = detailUrl.split('/');

        // First click the chapter
        selectComponent('MyChaptersPanel_Links')
          .find('a[href*="' + chapterUrl + '"]:eq(0)')
          .click();

        if (hasCollapsiblePanels) {
          expandCollapsiblePanels();
        }

        // Click the detail page link
        // Could fail if we show a link that has same url segment structure. E.g mijn.amsterdan.nl/burgerzaken/docment/x vs amsterdan.nl/burgerzaken/document/x
        cy.get('a[href*="' + detailUrl + '"]:eq(0)').click({ force: true });

        // Expand the statusline component should it be rendered collapsed
        cy.get('body').then($body => {
          if ($body.text().includes('Toon alles')) {
            cy.get('button')
              .contains('Toon alles')
              .click();
            cy.get('[class*="StatusLine_ListItem"]')
              .its('length')
              .should('be.gte', 2);
          }
        });
      } else {
        selectComponent('MyChaptersPanel_Links')
          .find('a[href*="' + pathname + '"]:eq(0)')
          .click();

        if (hasCollapsiblePanels) {
          expandCollapsiblePanels();
        }
      }

      selectComponent('LoadingContent_LoadingContent').should('not.exist');

      if (!process.env.CI) {
        cy.wait(500);
        cy.screenshot();
      }
    });
  }
});
