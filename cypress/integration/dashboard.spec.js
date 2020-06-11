import { itShouldLogoutAndInAgain, selectComponent } from '../support/helpers';

describe('Dashboard', () => {
  itShouldLogoutAndInAgain();

  it("Shows the Chapters Panel (Thema's)", () => {
    selectComponent('MyChaptersPanel_MyChaptersPanel').contains("Mijn thema's");
  });

  it('Belastingen Chapter is always visible', () => {
    selectComponent('MainNavSubmenu_MainNavSubmenuLink').contains(
      'Belastingen'
    );
  });

  it('Shows MyCases', () => {
    selectComponent('MyCases_MyCases').should('exist');
  });

  it('Shows MyArea', () => {
    selectComponent('MyArea_MapDashboard').should('exist');
  });

  it('Shows MyTips', () => {
    selectComponent('MyTips_MyTips').should('exist');
  });

  it('DirectLinks', () => {
    selectComponent('DirectLinks_DirectLinks').should('exist');
  });
});
