import { Container } from 'react-bootstrap';
import { PublicLayout } from '../components/layout/public';

export default function APropos({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar>
      <Container>
        A propos
      </Container>
    </PublicLayout>
  );
}

APropos.getInitialProps = ({ pathname })  => {
  return { pathname };
}
