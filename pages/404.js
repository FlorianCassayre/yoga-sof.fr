import { Container } from 'react-bootstrap';
import Link from 'next/link';
import { PublicLayout } from '../components/layout/public';

export default function Page404() {
  return (
    <PublicLayout pathname="/404" padNavbar title="Page introuvable">
      <Container className="p-4">
        <h1>Page introuvable</h1>
        <p>Si vous pensez qu'il s'agit d'une erreur, merci de nous le faire savoir.</p>
        <p>
          <Link href="/">Retourner à l'accueil</Link>
        </p>
      </Container>
    </PublicLayout>
  );
}
