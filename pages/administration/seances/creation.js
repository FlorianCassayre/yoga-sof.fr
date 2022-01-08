import {
  BREADCRUMB_SESSION_CREATE,
} from '../../../components';
import { SessionForm } from '../../../components/form';
import { PrivateLayout } from '../../../components/layout/admin';

export default function AdminSeanceCreate({ pathname }) {

  return (
    <PrivateLayout pathname={pathname} breadcrumb={BREADCRUMB_SESSION_CREATE}>
      <h1 className="h4">
        Nouveau modèle de séance
      </h1>

      <hr />

      <p>
        Ce formulaire vous permet de créer un nouveau modèle de séance.
        Toute planification de séance dépendra d'un modèle de séance.
        Attention : une fois créé, le modèle n'est pas modifiable.
      </p>

      <SessionForm />

    </PrivateLayout>
  );
}

AdminSeanceCreate.getInitialProps = ({ pathname })  => {
  return { pathname };
}
