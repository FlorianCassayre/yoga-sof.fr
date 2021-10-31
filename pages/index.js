import {
  BsFillCalendarFill,
  BsFillInfoCircleFill,
  BsFillPeopleFill,
  BsMoonStarsFill,
  BsPencilSquare,
} from 'react-icons/bs';
import { GrYoga } from 'react-icons/gr';
import {
  MapsComponent, LayersDirective, LayerDirective, Zoom, MarkersDirective, MarkerDirective, Marker, Inject
} from '@syncfusion/ej2-react-maps';
import Head from 'next/head';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Button, Col, Container, Image, Nav, Navbar, Row } from 'react-bootstrap';
import { MAP_COORDINATES } from './config';

export default function Home() {

  const CourseCard = ({ alt, title, description, image, infoAge, infoLevel, infoGroup }) => {
    const imageData = (
      <Image src={image} fluid className="rounded-3 shadow" />
    );
    const contentData = (
      <>
        <h2 className={'display-5' + ' ' + (alt ? 'text-end' : '')}>{title}</h2>
        <div className="text-justify">
          {description}
          <Row className="mt-4 text-center">
            <Col>
              <BsFillCalendarFill className="icon me-2" />
              <strong className="h5">Âge</strong>
              <br />
              <span>{infoAge}</span>
            </Col>
            <Col>
              <BsMoonStarsFill className="icon me-2" />
              <strong className="h5">Niveau</strong>
              <br />
              <span>{infoLevel}</span>
            </Col>
            <Col>
              <BsFillPeopleFill className="icon me-2" />
              <strong className="h5">Groupe</strong>
              <br />
              <span>{infoGroup}</span>
            </Col>
            <Col xs={12}>
              <Button variant="success" className="mt-4">
                <BsFillInfoCircleFill className="icon me-2" />
                Informations pratiques et inscription
              </Button>
            </Col>
          </Row>
        </div>
      </>
    );
    return (
      <div className="py-2 course-card" style={{ backgroundColor: alt ? 'white' : '#f7f7f7' }}>
        <Container>
          <Row className="align-items-center">
            <Col className="p-5">
              {alt ? contentData : imageData}
            </Col>
            <Col className="px-5">
              {alt ? imageData : contentData}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <div style={{ height: '100%' }}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navbar bg="light" fixed="top" className="shadow" style={{ '--bs-bg-opacity': 0.95 }}>
        <Container>
          <Navbar.Brand href="#home">
            <GrYoga className="icon me-2" />
            Yoga Sof
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="responsive-navbar-nav" />
          <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link href="#features" style={{ borderBottom: '5px solid purple' }}>Le yoga</Nav.Link>
              <Nav.Link href="#pricing">Les séances</Nav.Link>
              <Nav.Link href="#pricing">À propos</Nav.Link>
            </Nav>
            <Nav>
              <Nav.Link href="#deets">
                <Button>
                  <BsPencilSquare className="icon me-2" />
                  Inscription à un cours
                </Button>
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      <div className="shadow" style={{ background: 'url(./stock/woman_stretch_cropped.jpg) center center / cover no-repeat', width: '100%', height: '50vh', position: 'relative' }} />

      <CourseCard
        title="Séances de yoga adulte"
        description={(
          <>
            J'enseigne un hatha yoga doux et respectueux de votre corps, dans la bonne humeur et en petit groupe ou en individuel, à mon domicile à Hésingue. J'adapte les postures selon votre morphologie, votre force et votre souplesse, en toute bienveillance et loin de tout inconfort. Les séances sont progressives et incluent des postures, pranayamas relaxations ainsi qu'un travail mental pour vous amener à ressentir les bienfaits de votre pratique et progresser sur le chemin de la connaissance de vous. Tous niveaux.
          </>
        )}
        image="/stock/woman_baby.jpg"
        infoAge="Adultes"
        infoLevel="Tous"
        infoGroup="4 à 6 adultes"
      />

      <div className="skewed-1" />

      <CourseCard
        title="Séances de yoga enfant"
        description={(
          <>
            J'anime des pratiques de yoga ludiques et adaptées pour les enfants de 6-11 ans en petit groupe, à Hésingue. Elles sont une voie d'exploration, d'expression et de sagesse, un moyen bienveillant pour les enfants d'explorer leurs capacités et étendre leurs frontières, d'améliorer la conscience d'eux-mêmes et des autres, développer leurs capacités à reconnaître et accueillir leurs pensées et leurs émotions. Les postures sont nommées sur la thématique de la nature pour renforcer les liens de l'enfant et la nature.
          </>
        )}
        image="/stock/woman_baby.jpg"
        infoAge="6 à 11 ans"
        infoLevel="Initiation"
        infoGroup="2 à 3 enfants"
        alt
      />

      <div className="skewed-2" />

      <CourseCard
        title="Séances de yoga parent-enfant"
        description={(
          <>
            J'anime des ateliers de yoga en tandem parent(enfant de 4-6 ans, en petits groupes à Hésingue. Je les propose comme un moment de partage et de complicité où l'adulte (le parent ou grand-parent) se laisse guider dans sa pratique avec l'enfant, une pause privilégiée  à vivre loin de la dispersion et l'agitation du monde actuel. Il s'agit d'une approche ludique du yoga intégrant des petites histoires, contes ou chansons amusantes qui sollicite l'imaginaire et va renforcer le lien de l'adulte avec l'enfant.
          </>
        )}
        image="/stock/woman_baby.jpg"
        infoAge="4 à 6 ans"
        infoLevel="Tous"
        infoGroup="2 à 3 enfants"
      />

      <div className="shadow" style={{ background: 'url(./stock/nature.jpg) center center / cover no-repeat', width: '100%' }}>
        <div className="text-white p-4 text-center" style={{ width: '100%' }}>
          <blockquote className="blockquote">
            C'est à travers l'alignement de mon corps que j'ai découvert l'alignement de mon esprit, de mon Être et de mon intelligence
          </blockquote>
          <em>
            Sri B.K.S Iyengar
          </em>
        </div>
      </div>

      <div className="py-4 shadow-lg" style={{ backgroundColor: '#dfdfdf', zIndex: 10 }}>
        <Container>
          <Row xs={1} md={3}>
            <Col>

            </Col>
            <Col>

            </Col>
            <Col>
              {/*<MapsComponent id="maps" zoomSettings={{ zoomFactor: 14 }} centerPosition={MAP_COORDINATES}>
                <Inject services={[Marker, Zoom]}/>
                <LayersDirective>
                  <LayerDirective layerType='OSM'>
                    <MarkersDirective>
                      <MarkerDirective visible={true} height={50} width={50} dataSource={[
                        {
                          ...MAP_COORDINATES,
                          name: "California"
                        }
                      ]}>
                      </MarkerDirective>
                    </MarkersDirective>
                  </LayerDirective>
                </LayersDirective>
              </MapsComponent>*/}
            </Col>
          </Row>
        </Container>
      </div>

    </div>
  )
}
