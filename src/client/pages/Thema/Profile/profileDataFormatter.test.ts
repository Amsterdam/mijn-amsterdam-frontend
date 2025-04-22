import { describe, it, expect } from 'vitest';

import {
  formatProfileSectionData,
  ProfileLabels,
} from './profileDataFormatter';

type TestData = {
  name: string;
  age: number;
  email: string;
  who?: string;
};

type TestProfileData = {
  owner: TestData;
  foo?: { bar: string };
};

const labelConfig: ProfileLabels<TestData, TestProfileData> = {
  name: 'Name',
  age: ['Age', (value) => `${value} years old`],
  email: ['Email', (value) => value.toLowerCase()],
};

describe('formatProfileSectionData', () => {
  it('should format profile section data correctly', () => {
    const data: TestData = {
      name: 'John Doe',
      age: 30,
      email: 'JOHN@EXAMPLE.COM',
    };

    const profileData: TestProfileData = {
      owner: data,
    };

    const result = formatProfileSectionData(labelConfig, data, profileData);

    expect(result).toEqual({
      Name: 'John Doe',
      Age: '30 years old',
      Email: 'john@example.com',
    });
  });

  it('should not include falsey values', () => {
    const data: TestData = {
      name: '',
      age: 0,
      email: '',
    };

    const profileData: TestProfileData = {
      owner: data,
    };

    const result = formatProfileSectionData(labelConfig, data, profileData);

    expect(result).toEqual({
      Age: '0 years old',
    });
  });

  it('should handle label formatters that are functions', () => {
    const customLabelConfig: ProfileLabels<TestData, TestProfileData> = {
      name: [
        (profileSectionData) => `Custom ${profileSectionData.who}`,
        (value, _profileSectionData, profileData) =>
          `${value} + ${profileData?.foo?.bar}`,
      ],
      age: ['Age', (value) => `${value} years old`],
      email: ['Email', (value) => value.toLowerCase()],
    };

    const data: TestData = {
      name: 'Jane Doe',
      age: 25,
      email: 'JANE@EXAMPLE.COM',
      who: 'Mr.',
    };

    const profileData: TestProfileData = {
      owner: data,
      foo: { bar: 'baz' },
    };

    const result = formatProfileSectionData(
      customLabelConfig,
      data,
      profileData
    );

    expect(result).toEqual({
      'Custom Mr.': 'Jane Doe + baz',
      Age: '25 years old',
      Email: 'jane@example.com',
    });
  });
});
