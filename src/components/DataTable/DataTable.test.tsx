import React from 'react';
import { shallow } from 'enzyme';
import DataTable from './DataTable';

it('Renders without crashing', () => {
  shallow(
    <DataTable
      isLoading={false}
      items={[]}
      track={{ category: 'test', name: 'Data tabel' }}
      id="testje"
    />
  );
});
