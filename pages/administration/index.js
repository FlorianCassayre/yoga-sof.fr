import { useSession } from 'next-auth/client';
import { PrivateLayout } from '../../components/layout/private';
import Seances from '../seances';

export default function HomeAdmin({ pathname }) {
  const [session, loading] = useSession();

  if(typeof window !== 'undefined' && loading) {
    return null;
  }
  if(!session) {
    return (
      <>
        Accès interdit
      </>
    )
  }

  return (
    <PrivateLayout pathname={pathname}>

    </PrivateLayout>
  )
}

HomeAdmin.getInitialProps = ({ pathname })  => {
  return { pathname };
}
