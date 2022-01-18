import {
  BREADCRUMB_SESSION_CREATE,
} from '../../../../components';
import { SessionModelForm } from '../../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../../components/layout/admin';

export default function AdminSeanceCreate({ pathname }) {

  return (
    <PrivateLayout pathname={pathname}>
      <ContentLayout pathname={pathname} title="Nouveau modèle de séance" breadcrumb={BREADCRUMB_SESSION_CREATE}>

        <SessionModelForm />

      </ContentLayout>
    </PrivateLayout>
  );
}

AdminSeanceCreate.getInitialProps = ({ pathname })  => {
  return { pathname };
}
