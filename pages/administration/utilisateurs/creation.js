import { BREADCRUMB_USER_CREATE } from '../../../components';
import { UserForm } from '../../../components/form';
import { ContentLayout, PrivateLayout } from '../../../components/layout/admin';

export default function AdminUserCreate({ pathname }) {

  return (
    <PrivateLayout pathname={pathname}>
      <ContentLayout pathname={pathname} title="Création d'un utilisateur" breadcrumb={BREADCRUMB_USER_CREATE}>

        <UserForm />

      </ContentLayout>
    </PrivateLayout>
  );
}

AdminUserCreate.getInitialProps = ({ pathname }) => {
  return { pathname };
};
