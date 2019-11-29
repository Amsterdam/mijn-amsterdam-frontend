import { goToDashboard, selectComponent, assertPath } from '../support/helpers';

const assertNavigationForChapters = {
  ZORG: {
    path: '/zorg-en-ondersteuning',
    title: 'Zorg en ondersteuning',
  },
  INKOMEN: {
    path: '/werk-en-inkomen',
    title: 'Werk en inkomen',
  },
  AFVAL: {
    path: '/afval',
    title: 'Afval',
  },
};

describe('Navigate to Chapters', () => {
  goToDashboard();

  Object.entries(assertNavigationForChapters).forEach(
    ([id, { path, title }]) => {
      it(
        'DashbaordMyChapters: Should navigate to ' +
          assertNavigationForChapters[id].title,
        () => {
          const chapterLink = cy.get(
            '[class*="MyChaptersPanel_Links"] a[data-chapter-id=' + id + ']'
          );
          chapterLink.should('exist');
          chapterLink.click();
          assertPath(assertNavigationForChapters[id].path);
          selectComponent('PageHeading_PageHeading').should('contain', title);
          cy.go('back');
        }
      );
    }
  );

  it('Should show the MainNavBar Chapters submenu panel', () => {
    cy.get(
      '[class*="MainNavBar_LinkContainer"] [data-submenu-id="MIJN_THEMAS"] > button'
    ).trigger('mouseover');
    cy.get(
      '[class*="MainNavBar_LinkContainer"] [data-submenu-id="MIJN_THEMAS"] [class*="MainNavSubmenu_SubmenuPanelOpen"]'
    ).should('exist');
  });

  Object.entries(assertNavigationForChapters).forEach(
    ([id, { path, title }]) => {
      it(
        'MainMenu: Should navigate to ' + assertNavigationForChapters[id].title,
        () => {
          const chapterLink = cy.get(
            '[class*="MainNavBar_LinkContainer"] a[data-chapter-id=' + id + ']'
          );
          chapterLink.should('exist');
          chapterLink.click();
          assertPath(assertNavigationForChapters[id].path);
          selectComponent('PageHeading_PageHeading').should('contain', title);
        }
      );
    }
  );
});
