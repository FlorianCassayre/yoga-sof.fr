import {
  BREADCRUMB_SESSION_CREATE,
} from '../../../components';
import { SessionForm } from '../../../components/form';
import { PrivateLayout } from '../../../components/layout/admin';

export default function AdminSeanceCreate({ pathname }) {

  return (
    <PrivateLayout pathname={pathname} title="Nouveau modèle de séance" breadcrumb={BREADCRUMB_SESSION_CREATE}>

      <SessionForm />

    </PrivateLayout>
  );
}

AdminSeanceCreate.getInitialProps = ({ pathname })  => {
  return { pathname };
}
