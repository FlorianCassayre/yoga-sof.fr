import { Container } from 'react-bootstrap';
import { PublicLayout } from '../components/layout/public';

export default function Seances({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar>
      <Container>
        Les séances
      </Container>
    </PublicLayout>
  );
}

Seances.getInitialProps = ({ pathname })  => {
  return { pathname };
}
