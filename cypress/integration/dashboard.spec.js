import { assertAtHome, selectComponent } from '../support/helpers';

describe('Dashboard', function() {
  it('Visit login url always redirects user to Dashboard page', function() {
    cy.visit('/api/login');
    assertAtHome('Actueel');
  });

  it("Shows the Chapters Panel (Thema's)", function() {
    selectComponent('MyChaptersPanel_MyChaptersPanel').contains("Mijn thema's");
  });

  it('Belastingen Chapter is always visible', function() {
    selectComponent('MainNavSubmenu_MainNavSubmenuLink').contains(
      'Belastingen'
    );
  });

  it('Shows MyCases', function() {
    selectComponent('MyCases_MyCases').should('exist');
  });

  it('Shows MyArea', function() {
    selectComponent('MyArea_MyArea').should('exist');
  });

  it('Shows MyTips', function() {
    selectComponent('MyTips_MyTips').should('exist');
  });

  it('DirectLinks', function() {
    selectComponent('DirectLinks_DirectLinks').should('exist');
  });
});
