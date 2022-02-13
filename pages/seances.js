import Link from 'next/link';
import { Button, Container } from 'react-bootstrap';
import { BsPencilSquare } from 'react-icons/bs';
import { PracticalInformations } from '../components';
import { PublicLayout } from '../components/layout/public';
import {
  practicalInformationsAdult,
  practicalInformationsChildren,
  practicalInformationsParentChildren,
} from '../components/PracticalInformations';

export default function Seances({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar title="Les séances">
      <Container className="p-4">
        <h1>Les séances</h1>
        <h2 id="adulte">Yoga adulte</h2>
        <PracticalInformations data={practicalInformationsAdult} />
        <div className="text-center">
          <Link href="/inscription">
            <Button variant="success" className="mt-3">
              <BsPencilSquare className="icon me-2 mx-2" />
              Inscription à une séance de Yoga adulte
            </Button>
          </Link>
        </div>
        <hr />
        <h2 id="enfant" className="mt-4">Yoga enfant</h2>
        <PracticalInformations data={practicalInformationsChildren} />
        <hr />
        <h2 id="parent-enfant" className="mt-4">Yoga parent-enfant</h2>
        <PracticalInformations data={practicalInformationsParentChildren} />
      </Container>
    </PublicLayout>
  );
}

Seances.getInitialProps = ({ pathname })  => {
  return { pathname };
}
