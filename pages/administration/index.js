import { BREADCRUMB_OVERVIEW, SessionsCards } from '../../components';
import { PrivateLayout } from '../../components/layout/admin';

export default function AdminHome({ pathname }) {
  return (
    <PrivateLayout pathname={pathname} title="Aperçu" breadcrumb={BREADCRUMB_OVERVIEW}>

      <SessionsCards />

    </PrivateLayout>
  )
}

AdminHome.getInitialProps = ({ pathname })  => {
  return { pathname };
}
