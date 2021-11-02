import {
  Inject,
  LayerDirective,
  LayersDirective,
  MapsComponent,
  Marker,
  MarkerDirective,
  MarkersDirective,
  Zoom,
} from '@syncfusion/ej2-react-maps';
import Head from 'next/head';
import { useState } from 'react';
import { Button, Col, Container, Nav, Navbar, Row } from 'react-bootstrap';
import { BsFillGeoAltFill, BsPencilSquare } from 'react-icons/bs';
import { GrYoga } from 'react-icons/gr';
import Link from 'next/link';

const MAP_COORDINATES = { latitude: 47.576129, longitude: 7.514619 };

export function PublicLayout({ children, pathname, padNavbar }) {

  const [isMapLoaded, setMapLoaded] = useState(false);

  const propsForPathname = pathnameOther => pathnameOther === pathname ? { active: true, className: 'navbar-page-active' } : {};

  const NavLink = ({ pathname: pathnameOther, children }) => (
    <Link href={pathnameOther} passHref>
      <Nav.Link {...propsForPathname(pathnameOther)}>{children}</Nav.Link>
    </Link>
  );

  const FooterLink = ({ href, children }) => (
    <div>
      <Link href={href} passHref>
        <a className="link-light">{children}</a>
      </Link>
    </div>
  );

  return (
    <div style={{ height: '100%' }}>
      <Head>
        <title>Yoga Sof</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar bg="light" fixed="top" className="shadow" style={{ '--bs-bg-opacity': 0.95 }}>
        <Container>
          <Link href="/" passHref>
            <Navbar.Brand>
              <GrYoga className="icon me-2" />
              Yoga Sof
            </Navbar.Brand>
          </Link>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <NavLink pathname="/">
                Accueil
              </NavLink>
              <NavLink pathname="/yoga">
                Le yoga
              </NavLink>
              <NavLink pathname="/seances">
                Les séances
              </NavLink>
              <NavLink pathname="/a-propos">
                À propos
              </NavLink>
            </Nav>
            <Nav>
              <Link href="/inscription">
                <Button disabled={pathname === '/inscription'}>
                  <BsPencilSquare className="icon me-2" />
                  Je m'inscris à une séance
                </Button>
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {padNavbar && (
        <div style={{ height: '56px' }} />
      )}

      {children}

      <div className="py-4" style={{ backgroundColor: '#323232', zIndex: 10 }}>
        <Container>
          <Row xs={1} md={3} className="align-items-center text-white">
            <Col className="text-center px-5">
              <FooterLink href="/">Accueil</FooterLink>
              <FooterLink href="/yoga">Le yoga</FooterLink>
              <FooterLink href="/seances">Séances et informations pratiques</FooterLink>
              <FooterLink href="/inscription">Inscription</FooterLink>
              <FooterLink href="/a-propos">À propos</FooterLink>
              {/*<FooterLink href="#">Contact</FooterLink>*/}
              <FooterLink href="/cgu">Conditions générales d'utilisation</FooterLink>
              <FooterLink href="/cgv">Conditions générales de vente</FooterLink>
            </Col>
            <Col className="text-end px-5">
              <strong>Association "Yoga Sof"</strong><br /><br />
              <strong>Coach</strong><br />
              Sophie Richaud-Cassayre<br />
              <em>Yoguyiste de niveau 4</em><br /><br />

              <strong>Adresse</strong><br />
              <em>
                8 rue des moissonneurs<br />
                Hésingue - 68220
              </em>
            </Col>
            <Col>
              {isMapLoaded ? (
                <MapsComponent id="maps" zoomSettings={{ zoomFactor: 14 }} centerPosition={MAP_COORDINATES} height="250px">
                  <Inject services={[Marker, Zoom]} />
                  <LayersDirective>
                    <LayerDirective layerType="OSM">
                      <MarkersDirective>
                        <MarkerDirective visible={true} height={50} width={50} dataSource={[
                          {
                            ...MAP_COORDINATES,
                            name: 'Hésingue',
                          },
                        ]}>
                        </MarkerDirective>
                      </MarkersDirective>
                    </LayerDirective>
                  </LayersDirective>
                </MapsComponent>
              ) : (
                <div className="text-center">
                  <Button variant="secondary" onClick={() => setMapLoaded(true)}>
                    <BsFillGeoAltFill className="icon me-2" />
                    Voir sur la carte
                  </Button>
                </div>
              )}

            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
}
