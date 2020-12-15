import { itShouldLogoutAndInAgain, selectComponent } from '../support/helpers';

describe('Navigate to Chapters', () => {
  itShouldLogoutAndInAgain();

  it('should open the Tips opt-in modal', () => {
    selectComponent('MyTips_OptIn').should('exist');
    selectComponent('MyTips_OptIn').should('contain', 'Maak tips persoonlijk');
    selectComponent('MyTips_OptIn').click();
    selectComponent('Modal_Modal').should('exist');
  });

  it('Should be able to click the opt-in-out button to Opt-in or Opt-out', () => {
    selectComponent('MyTips_OptInOutConfirmButton').should('exist');
    selectComponent('MyTips_OptInOutConfirmButton').should(
      'contain',
      'Ja, maak tips persoonlijk'
    );
    cy.get('[class*="MyTips_TipItem__"]:first').should(
      'not.have.class',
      'is-personalized'
    );
    selectComponent('MyTips_OptInOutConfirmButton').click();
    selectComponent('Modal_Modal').should('not.exist');

    selectComponent('MyTips_OptIn').should('contain', 'Toon alle tips');
    cy.get('[class*="MyTips_TipItem__"]:first').should(
      'have.class',
      'is-personalized'
    );
    selectComponent('MyTips_OptIn').click();
    selectComponent('Modal_Modal').should('exist');
    selectComponent('MyTips_OptInOutConfirmButton').should(
      'contain',
      'Nee, toon geen persoonlijke tips'
    );
    selectComponent('MyTips_OptInOutConfirmButton').click();
    selectComponent('Modal_Modal').should('not.exist');
    cy.get('[class*="MyTips_TipItem__"]:first').should(
      'not.have.class',
      'is-personalized'
    );
  });
});
