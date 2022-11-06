import Link from 'next/link';
import { Badge, Button } from 'react-bootstrap';
import { BsJournalText, BsPlusLg } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';
import { DynamicPaginatedTable, cancelRegistrationColumn, plannedCourseLinkColumn, userLinkColumn } from '../../../components/table';
import { BREADCRUMB_REGISTRATIONS } from '../../../lib/client';
import { displayDatetime, formatTimestamp } from '../../../lib/common';

function AdminRegistrationsLayout() {
  return (
    <ContentLayout title="Inscriptions" icon={BsJournalText} breadcrumb={BREADCRUMB_REGISTRATIONS}>
      <p>Liste des inscriptions passées et futures à des séances programmées.</p>

      <DynamicPaginatedTable
        url="/api/courseRegistrations"
        params={(page, limit, { sort }) => ({
          page,
          limit,
          orderBy: sort ? { [sort.column]: sort.order ? '$asc' : '$desc' } : undefined,
          include: ['course', 'user'],
        })}
        columns={[
          userLinkColumn,
          { ...plannedCourseLinkColumn, name: 'course.dateStart', sortable: true },
          {
            title: `Date d'inscription`,
            name: 'createdAt',
            sortable: true,
            initialSortValue: false,
            render: ({ createdAt }) => displayDatetime(createdAt),
          },
          {
            title: 'Statut',
            name: 'canceledAt',
            sortable: true,
            render: ({ isUserCanceled, canceledAt }) => (!isUserCanceled ? <Badge bg="success">Inscrit</Badge> : (
              <Badge bg="danger">
                Désinscrit à
                {' '}
                {formatTimestamp(canceledAt)}
              </Badge>
            )),
            props: { className: 'text-center' },
          },
          cancelRegistrationColumn,
        ]}
        renderEmpty={() => 'Aucun utilisateur ne s\'est inscrit pour le moment.'}
      />

      <div className="text-center">
        <Link href="/administration/inscriptions/CourseRegistrationCreate" passHref>
          <Button variant="success">
            <BsPlusLg className="icon me-2" />
            Inscrire un utilisateur à une séance
          </Button>
        </Link>
      </div>
    </ContentLayout>
  );
}

export default function AdminRegistrations() {
  return (
    <PrivateLayout title="Inscriptions" breadcrumb={BREADCRUMB_REGISTRATIONS}>
      <AdminRegistrationsLayout />
    </PrivateLayout>
  );
}
