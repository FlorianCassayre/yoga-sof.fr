import { Container } from 'react-bootstrap';
import { PublicLayout } from '../components/PublicLayout';

export default function Yoga({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar>
      <Container>
        Le yoga
      </Container>
    </PublicLayout>
  );
}

Yoga.getInitialProps = ({ pathname })  => {
  return { pathname };
}
