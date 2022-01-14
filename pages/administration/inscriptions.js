import Link from 'next/link';
import {
  BREADCRUMB_REGISTRATIONS,
  PaginatedTable,
} from '../../components';
import { PrivateLayout } from '../../components/layout/admin';

export default function AdminRegistrations({ pathname }) {

  return (
    <PrivateLayout pathname={pathname} title="Inscriptions" breadcrumb={BREADCRUMB_REGISTRATIONS}>

      <p>
        Liste des inscriptions passées et futures à des séances programmées.
      </p>

      <PaginatedTable
        url="/api/registrations"
        params={(page, limit) => ({
          page,
          limit,
          include: ['session', 'user'],
        })}
        columns={[
          {
            title: '#',
            render: ({ id }) => id,
          },
        ]}
      />

    </PrivateLayout>
  )
}

AdminRegistrations.getInitialProps = ({ pathname })  => {
  return { pathname };
}
