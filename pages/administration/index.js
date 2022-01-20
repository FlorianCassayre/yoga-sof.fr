import { BREADCRUMB_OVERVIEW, SessionsCards } from '../../components';
import { ContentLayout, PrivateLayout } from '../../components/layout/admin';

function AdminHomeLayout({ pathname }) {
  return (
    <ContentLayout pathname={pathname} title="Aperçu" breadcrumb={BREADCRUMB_OVERVIEW}>

      <h2 className="h5">Planning</h2>

      <SessionsCards readonly />

    </ContentLayout>
  );
}

export default function AdminHome({ pathname }) {
  return (
    <PrivateLayout pathname={pathname}>

      <AdminHomeLayout pathname={pathname} />

    </PrivateLayout>
  )
}

AdminHome.getInitialProps = ({ pathname })  => {
  return { pathname };
}
