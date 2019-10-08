import { assertAtHome } from '../support/helpers';

describe('Landing page and login', function() {
  it('works', () => {
    cy.request('/');
  });
});
