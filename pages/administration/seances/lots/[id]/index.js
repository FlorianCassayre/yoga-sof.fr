import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button } from 'react-bootstrap';
import { BsCollection, BsPencil } from 'react-icons/bs';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import {
  adaptColumn,
  plannedCourseLinkColumn,
  StaticPaginatedTable,
} from '../../../../../components/table';
import { usePromiseEffect } from '../../../../../hooks';
import { breadcrumbForBundle } from '../../../../../lib/client';
import { getBundle } from '../../../../../lib/client/api';
import { displayBundleName } from '../../../../../lib/common';

function BundleViewLayout({ id }) {
  const { isLoading, isError, data, error } = usePromiseEffect(() => getBundle(id, { include: ['courses'] }), []);

  return (
    <ContentLayout
      title={data && data.name}
      icon={BsCollection}
      headTitle={data && displayBundleName(data)}
      breadcrumb={data && breadcrumbForBundle(data)}
      isLoading={isLoading}
      isError={isError}
      error={error}
    >
      <div className="mb-3">
        <Link href={`/administration/seances/lots/${id}/edition`} passHref>
          <Button className="me-2">
            <BsPencil className="icon me-2" />
            Modifier le nom
          </Button>
        </Link>
      </div>

      <h2 className="h5">Séances dans ce lot</h2>

      <StaticPaginatedTable
        rows={data && data.courses}
        columns={[
          adaptColumn(course => ({ courseId: course.id, course }))(plannedCourseLinkColumn),
        ]}
        // columns={[userLinkColumn, registrationDateColumn, adaptColumn(registration => ({ ...registration, course: data }))(cancelRegistrationColumn)]}
        renderEmpty={() => 'Ce lot ne contient aucune séance.'}
      />
    </ContentLayout>
  );
}

export default function BundleView() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <BundleViewLayout id={id} />
    </PrivateLayout>
  );
}
