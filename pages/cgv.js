import { Container } from 'react-bootstrap';
import { PublicLayout } from '../components/PublicLayout';

export default function CGV({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar>
      <Container>
        CGV
      </Container>
    </PublicLayout>
  );
}

CGV.getInitialProps = ({ pathname })  => {
  return { pathname };
}
