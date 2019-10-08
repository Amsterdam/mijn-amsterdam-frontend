import { assertAtHome } from '../support/helpers';

describe('Landing page and login', function() {
  it('works', () => {
    cy.request('http://api:5000/api/login');
  });
});
