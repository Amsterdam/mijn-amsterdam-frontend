import React from 'react';
import { shallow } from 'enzyme';
import DataLinkTable from './DataTable';

it('Renders without crashing', () => {
  shallow(
    <DataLinkTable
      isLoading={false}
      items={[]}
      track={{ category: 'test', name: 'Data tabel' }}
      id="testje"
    />
  );
});
