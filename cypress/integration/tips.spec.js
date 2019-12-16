import { goToDashboard, selectComponent } from '../support/helpers';

describe('Navigate to Chapters', () => {
  goToDashboard();

  it('should open the Tips opt-in modal', () => {
    selectComponent('MyTips_OptIn').should('exist');
    selectComponent('MyTips_OptIn').should('contain', 'Toon persoonlijke tips');
    selectComponent('MyTips_OptIn').click();
    selectComponent('Modal_Modal').should('exist');
  });

  it('Should be able to click the opt-in-out button to Opt-in or Opt-out', () => {
    selectComponent('MyTips_OptInOutConfirmButton').should('exist');
    selectComponent('MyTips_OptInOutConfirmButton').should(
      'contain',
      'Ja, toon persoonlijke tips'
    );
    cy.get(
      '[class*="MyTips_TipItem__"]:first [class*="Heading_Heading"]'
    ).should('not.contain', 'PERSONAL');
    selectComponent('MyTips_OptInOutConfirmButton').click();
    selectComponent('Modal_Modal').should('not.exist');

    selectComponent('MyTips_OptIn').should(
      'contain',
      'Toon geen persoonlijke tips'
    );
    cy.get(
      '[class*="MyTips_TipItem__"]:first [class*="Heading_Heading"]'
    ).should('contain', 'PERSONAL');
    selectComponent('MyTips_OptIn').click();
    selectComponent('Modal_Modal').should('exist');
    selectComponent('MyTips_OptInOutConfirmButton').should(
      'contain',
      'Nee, toon geen persoonlijke tips'
    );
    selectComponent('MyTips_OptInOutConfirmButton').click();
    selectComponent('Modal_Modal').should('not.exist');
    cy.get(
      '[class*="MyTips_TipItem__"]:first [class*="Heading_Heading"]'
    ).should('not.contain', 'PERSONAL');
  });
});
