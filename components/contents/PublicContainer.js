import { Container } from 'react-bootstrap';
import { PublicLayout } from '../layout/public';

export function PublicContainer({ children, ...rest }) {
  return (
    <PublicLayout {...rest}>
      <Container className="p-4">
        {children}
      </Container>
    </PublicLayout>
  );
}
