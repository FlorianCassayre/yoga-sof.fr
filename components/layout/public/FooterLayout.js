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
import { BsArrowLeft, BsEnvelopeFill, BsFacebook, BsFillGeoAltFill, BsSearch, BsZoomIn } from 'react-icons/bs';

const MAP_COORDINATES_HOME = { latitude: 47.576129, longitude: 7.514619 };
const MAP_COORDINATES_COMETE = { latitude: 47.580615, longitude: 7.520265 };

export function FooterLayout() {

  const [isMapToggled, setMapToggled] = useState(false);
  const [mapLocation, setMapLocation] = useState(null);

  const handleMapClick = () => {
    const url = `https://www.google.com/maps/place/${mapLocation.latitude},${mapLocation.longitude}`;
    window.open(url, '_blank').focus();
  };

  const FooterLink = ({ href, children }) => (
    <div>
      <Link href={href} passHref>
        <a className="link-light">{children}</a>
      </Link>
    </div>
  );

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
            {/*<FooterLink href="#">Contact</FooterLink>*/}
            {/*<FooterLink href="/cgu">Conditions générales d'utilisation</FooterLink>
            <FooterLink href="/cgv">Conditions générales de vente</FooterLink>*/}
          </Col>
          <Col xs={12} sm={6} lg={4} className="py-4 px-5 text-center text-md-end">
            <strong>Yoga Sof</strong><br /><br />
            Sophie Richaud-Cassayre<br />
            <em>Enseignante de Yoga</em><br /><br />

            <div className="h3">
              <a href="https://www.facebook.com/Yoga-Sof-102478218061902" target="_blank" rel="noreferrer" className="footer-link">
                <BsFacebook className="icon" />
              </a>
              <a href={`mailto:${'contact' + '@' + 'yoga-sof.fr'}`} target="_blank" rel="noreferrer" className="ms-3 footer-link">
                <BsEnvelopeFill className="icon" />
              </a>
            </div>

          </Col>
          <Col xs={12} sm={12} lg={4} className="py-4 px-5">
            {isMapToggled && mapLocation ? (
              <>
                <MapsComponent id="maps" zoomSettings={{ zoomFactor: 14 }} centerPosition={mapLocation} height="250px" click={handleMapClick} style={{ cursor: 'pointer' }}>
                  <Inject services={[Marker, Zoom]} />
                  <LayersDirective>
                    <LayerDirective layerType="OSM">
                      <MarkersDirective>
                        <MarkerDirective visible={true} height={50} width={50} dataSource={[
                          {
                            ...mapLocation,
                            name: 'Hésingue',
                          },
                        ]}>
                        </MarkerDirective>
                      </MarkersDirective>
                    </LayerDirective>
                  </LayersDirective>
                </MapsComponent>
                <div className="text-center">
                  <Button variant="secondary" onClick={() => setMapLocation(null)} className="mt-2">
                    <BsArrowLeft className="icon me-2" />
                    Retour
                  </Button>
                </div>
              </>
            ) : isMapToggled ? (
              <div className="text-center" key={1}>
                <div>
                  Les séances ne se déroulent pas toutes au même endroit :
                </div>
                <Button variant="secondary" onClick={() => setMapLocation(MAP_COORDINATES_HOME)} className="m-2">
                  <BsZoomIn className="icon me-2" />
                  Yoga adulte
                </Button>
                <Button variant="secondary" onClick={() => setMapLocation(MAP_COORDINATES_COMETE)} className="m-2">
                  <BsZoomIn className="icon me-2" />
                  Yoga enfant & parent-enfant
                </Button>
              </div>
            ) : (
              <div className="text-center">
                <Button variant="secondary" onClick={() => setMapToggled(true)}>
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