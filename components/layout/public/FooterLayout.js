import Link from 'next/link';
import { Col, Container, Row } from 'react-bootstrap';
import { BsEnvelopeFill, BsFacebook } from 'react-icons/bs';
import { EMAIL_CONTACT, FACEBOOK_PAGE_URL } from '../../../lib/common';
import { MapWidget } from '../../MapWidget';

function FooterLink({ href, children }) {
  return (
    <div>
      <Link href={href} passHref>
        <a className="link-light">{children}</a>
      </Link>
    </div>
  );
}

export function FooterLayout() {
  return (
    <footer className="mt-auto" style={{ backgroundColor: '#323232', zIndex: 10 }}>
      <Container>
        <Row className="align-items-center text-white">
          <Col xs={12} sm={6} lg={4} className="py-4 px-5 text-center">
            <FooterLink href="/">Accueil</FooterLink>
            <FooterLink href="/yoga">Le Yoga</FooterLink>
            <FooterLink href="/seances">Les séances</FooterLink>
            <FooterLink href="/inscription">Inscription</FooterLink>
            <FooterLink href="/a-propos">À propos</FooterLink>
            <FooterLink href="/reglement-interieur">Règlement intérieur</FooterLink>
            {/* <FooterLink href="#">Contact</FooterLink> */}
            {/* <FooterLink href="/cgu">Conditions générales d'utilisation</FooterLink>
            <FooterLink href="/cgv">Conditions générales de vente</FooterLink> */}
          </Col>
          <Col xs={12} sm={6} lg={4} className="py-4 px-5 text-center text-md-end">
            <strong>Yoga Sof</strong>
            <br />
            <br />
            Sophie Richaud-Cassayre
            <br />
            <em>Enseignante de Yoga</em>
            <br />
            <br />
            <div className="h3">
              <a href={FACEBOOK_PAGE_URL} target="_blank" rel="noreferrer" className="footer-link">
                <BsFacebook className="icon" />
              </a>
              <a href={`mailto:${EMAIL_CONTACT}`} target="_blank" rel="noreferrer" className="ms-3 footer-link">
                <BsEnvelopeFill className="icon" />
              </a>
            </div>
          </Col>
          <Col xs={12} sm={12} lg={4} className="py-4 px-5">
            <MapWidget />
          </Col>
        </Row>
      </Container>
    </footer>
  );
}
