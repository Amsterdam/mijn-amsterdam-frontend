import { query, queryGET, queryALL } from './fake-db.ts';

describe('fake-db', () => {
  it('the methods of module fake-db should return falsy values', async () => {
    const queryResult = await query('SELECT * FROM table');
    expect(queryResult).toBeFalsy();

    const queryGETResult = await queryGET('SELECT * FROM table');
    expect(queryGETResult).toBeFalsy();

    const queryALLResult = await queryALL('SELECT * FROM table');
    expect(queryALLResult).toHaveLength(0);
  });
});
