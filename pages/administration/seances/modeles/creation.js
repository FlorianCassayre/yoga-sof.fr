import { BsCalendar } from 'react-icons/bs';
import { CourseModelForm } from '../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../components/layout/admin';
import { BREADCRUMB_COURSE_CREATE } from '../../../../lib/client';

export default function AdminSeanceCreate() {
  return (
    <PrivateLayout>
      <ContentLayout title="Nouveau modèle de séance" icon={BsCalendar} breadcrumb={BREADCRUMB_COURSE_CREATE}>
        <CourseModelForm />
      </ContentLayout>
    </PrivateLayout>
  );
}
