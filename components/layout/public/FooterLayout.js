import {
  Inject,
  LayerDirective,
  LayersDirective,
  MapsComponent,
  Marker, MarkerDirective,
  MarkersDirective,
  Zoom,
} from '@syncfusion/ej2-react-maps';
import Link from 'next/link';
import { useState } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import { BsFillGeoAltFill } from 'react-icons/bs';

const MAP_COORDINATES = { latitude: 47.576129, longitude: 7.514619 };

export function FooterLayout() {

  const [isMapLoaded, setMapLoaded] = useState(false);

  const FooterLink = ({ href, children }) => (
    <div>
      <Link href={href} passHref>
        <a className="link-light">{children}</a>
      </Link>
    </div>
  );

  return (
    <footer className="py-4" style={{ backgroundColor: '#323232', zIndex: 10 }}>
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
    </footer>
  );
}