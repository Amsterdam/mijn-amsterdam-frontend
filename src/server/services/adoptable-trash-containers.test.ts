import MockDate from 'mockdate';

import { forTesting } from './adoptable-trash-containers';

describe('determineDescriptionText Tests', () => {
  test('Returns adults text when adult', () => {
    MockDate.set('01-01-2024');

    const birthday = new Date('01-01-2006');

    const result = forTesting.determineDescriptionText(birthday);
    expect(result).toMatchInlineSnapshot(`
      "Help mee om uw eigen buurt schoon te houden en adopteer een afvalcontainer.
       Liever op een andere manier bijdragen? Leen dan een afvalgrijper!"
    `);
  });

  test('Returns teen text when late teen', () => {
    MockDate.set('01-01-2024');

    const birthday = new Date('01-01-2008');

    const result = forTesting.determineDescriptionText(birthday);
    expect(result).toMatchInlineSnapshot(`
      "Help mee om je eigen buurt schoon te houden en adopteer een afvalcontainer.
       Wil je liever iets anders doen? Leen dan een afvalgrijper!"
    `);
  });

  test('Returns undefined when age is lower then that of a late teen', () => {
    MockDate.set('01-01-2024');

    const birthday = new Date('01-01-2009');

    const result = forTesting.determineDescriptionText(birthday);
    expect(result).toBeUndefined();
  });
});
