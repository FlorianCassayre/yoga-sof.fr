import { useRouter } from 'next/router';
import { BsCalendar } from 'react-icons/bs';
import { CourseModelForm } from '../../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../../components/layout/admin';
import { breadcrumbForCourseModelEdit } from '../../../../../lib/client';

export default function AdminSeance() {
  const router = useRouter();
  const { id } = router.query;

  return (
    <PrivateLayout>
      <CourseModelForm
        editRecordId={id}
        // eslint-disable-next-line react/no-unstable-nested-components
        container={({ data, ...props }) => <ContentLayout {...props} title="Modification d'un modèle de séance" icon={BsCalendar} breadcrumb={data && breadcrumbForCourseModelEdit(data)} />}
      />
    </PrivateLayout>
  );
}
