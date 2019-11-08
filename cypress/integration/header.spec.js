import { selectComponent } from '../support/helpers';

describe('Header', () => {
  it('Header shows Hero', () => {
    cy.login();
    selectComponent('MainHeaderHero_MainHeaderHero').should('exist');
  });

  it('Header shows menu items', () => {
    selectComponent('MainNavBar_MainNavBar').should('exist');
    selectComponent('MainNavBar_MainNavBar')
      .get('a')
      .should('exist');
  });

  it('(PHONE) Should show the burger menu when on a small screen', () => {
    cy.viewport('iphone-6');
    selectComponent('MainNavBar_BurgerMenuToggleBtn').should('exist');
  });

  it('(PHONE) Should toggle the menu overlay', () => {
    cy.viewport('iphone-6');
    selectComponent('MainNavBarAnim-enter').should('not.exist');
    selectComponent('MainNavBar_BurgerMenuToggleBtn').click();
    selectComponent('MainNavBarAnim-enter').should('exist');
    selectComponent('MainNavBar_BurgerMenuToggleBtn').click();
    selectComponent('MainNavBarAnim-enter').should('not.exist');
  });

  it('Should toggle the tutorial', () => {
    selectComponent('Tutorial_Tutorial').should('not.exist');
    selectComponent('MainNavBar_TutorialBtn').click();
    selectComponent('Tutorial_Tutorial').should('exist');
    selectComponent('MainNavBar_TutorialBtn').click();
    selectComponent('Tutorial_Tutorial').should('not.exist');
  });
});
