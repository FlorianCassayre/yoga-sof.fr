import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { DataGrid } from '../../../components/grid/DataGrid';

interface Row {
  id: number;
}

describe('DataGrid', () => {
  it('shows the server error inside the grid content', () => {
    const { container } = render(
      <DataGrid<Row>
        columns={[{ field: 'id' }]}
        defaultSort={{ field: 'id', sort: 'asc' }}
        procedure={{
          useQuery: () => ({ error: new Error('La séance est complète.'), isFetching: false }),
        }}
      />,
    );

    expect(container.querySelector('.MuiDataGrid-root')).toBeTruthy();
    expect(screen.getByRole('alert').textContent).toContain('La séance est complète.');
  });
});
