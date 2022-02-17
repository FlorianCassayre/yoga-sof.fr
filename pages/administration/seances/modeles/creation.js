import { BsCalendar } from 'react-icons/bs';
import { SessionModelForm } from '../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../components/layout/admin';
import { BREADCRUMB_SESSION_CREATE } from '../../../../lib/client';

export default function AdminSeanceCreate() {
  return (
    <PrivateLayout>
      <ContentLayout title="Nouveau modèle de séance" icon={BsCalendar} breadcrumb={BREADCRUMB_SESSION_CREATE}>
        <SessionModelForm />
      </ContentLayout>
    </PrivateLayout>
  );
}
