import { Container } from 'react-bootstrap';
import { PublicLayout } from '../components/layout/public';

export default function CGU({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar>
      <Container>
        CGU
      </Container>
    </PublicLayout>
  );
}

CGU.getInitialProps = ({ pathname })  => {
  return { pathname };
}
