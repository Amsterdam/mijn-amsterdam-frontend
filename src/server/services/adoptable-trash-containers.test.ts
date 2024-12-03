import { forTesting } from './adoptable-trash-containers';

describe('determineDescriptionText Tests', () => {
  test('Returns adults text when adult', () => {
    const age = 18;
    const result = forTesting.determineDescriptionText(age);
    expect(result).toMatchInlineSnapshot(`
      "Help mee om uw eigen buurt schoon te houden en adopteer een afvalcontainer.
       Liever op een andere manier bijdragen? Leen dan een afvalgrijper!"
    `);
  });

  test('Returns more youthly aimed text when person is below 18', () => {
    const age = 16;
    const result = forTesting.determineDescriptionText(age);
    expect(result).toMatchInlineSnapshot(`
      "Help mee om je eigen buurt schoon te houden en adopteer een afvalcontainer.
       Wil je liever iets anders doen? Leen dan een afvalgrijper!"
    `);
  });
});
