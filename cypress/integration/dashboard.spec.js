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
});
