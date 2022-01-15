import { RiDoubleQuotesL, RiDoubleQuotesR } from 'react-icons/ri';
import {
  BsDot,
  BsFillCalendarFill, BsFillCalendarWeekFill,
  BsFillInfoCircleFill,
  BsFillPeopleFill,
  BsMoonStarsFill,
  BsStars,
} from 'react-icons/bs';
import { Alert, Button, Col, Container, Image, Row } from 'react-bootstrap';
import { PublicLayout } from '../components/layout/public';
import Link from 'next/link';

export default function Home({ pathname }) {

  const CourseCard = ({ alt, title, description, image, infoAge, infoLevel, infoGroup, urlSection }) => {
    const imageData = (
      <div className="text-center">
        <Image src={image} fluid className="rounded-3 shadow" />
      </div>
    );
    const contentData = (
      <>
        <h2 className={'display-6 text-start' + ' ' + (alt ? 'text-lg-end' : '')}>{title}</h2>
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
              <Link href={`/seances#${urlSection}`}>
                <Button variant="success" className="mt-4">
                  <BsFillInfoCircleFill className="icon me-2" />
                  Informations pratiques et inscription
                </Button>
              </Link>
            </Col>
          </Row>
        </div>
      </>
    );

    return (
      <div className="py-2 course-card" style={{ backgroundColor: alt ? '#fcfcfc' : '#f7f7f7' }}>
        <Container>
          <Row className="align-items-center">
            <Col xs={{ span: 12, order: alt ? 2 : 1 }} lg={{ span: 6, order: 1 }} className="px-5 py-4">
              {alt ? contentData : imageData}
            </Col>
            <Col xs={{ span: 12, order: alt ? 1 : 2 }} lg={{ span: 6, order: 2 }} className="px-5 py-4">
              {alt ? imageData : contentData}
            </Col>
          </Row>
        </Container>
      </div>
    );
  }

  return (
    <PublicLayout pathname={pathname}>
      <div className="shadow header-image" style={{ width: '100%', height: '50vh', position: 'relative' }}>
        <div className="text-white text-center p-4" style={{ position: 'absolute', bottom: 0, width: '100%', textShadow: '2px 2px 4px #000000', zIndex: 100 }}>
          <h1 className="display-1">Yoga Sof</h1>
          <br />
          <span className="fs-2">Coach de yoga à Hésingue</span>
        </div>
      </div>

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
        urlSection="adulte"
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
        urlSection="enfant"
        alt
      />

      <div className="skewed-2" />

      <CourseCard
        title="Séances de yoga parent-enfant"
        description={(
          <>
            J'anime des ateliers de yoga en tandem parent-enfant de 4-6 ans, en petits groupes à Hésingue. Je les propose comme un moment de partage et de complicité où l'adulte (le parent ou grand-parent) se laisse guider dans sa pratique avec l'enfant, une pause privilégiée  à vivre loin de la dispersion et l'agitation du monde actuel. Il s'agit d'une approche ludique du yoga intégrant des petites histoires, contes ou chansons amusantes qui sollicite l'imaginaire et va renforcer le lien de l'adulte avec l'enfant.
          </>
        )}
        image="/stock/woman_baby.jpg"
        infoAge="4 à 6 ans"
        infoLevel="Tous"
        infoGroup="2 à 3 enfants"
        urlSection="parent-enfant"
      />

      <div className="shadow quote-image" style={{ width: '100%' }}>
        <div className="text-white p-4 text-center" style={{ width: '100%' }}>
          <blockquote className="blockquote">
            <RiDoubleQuotesL className="icon me-2" />
            C'est à travers l'alignement de mon corps que j'ai découvert l'alignement de mon esprit, de mon Être et de mon intelligence
            <RiDoubleQuotesR className="icon ms-2" />
          </blockquote>
          <em>
            Sri B.K.S Iyengar
          </em>
        </div>
      </div>

      <div className="py-5 course-card" style={{ backgroundColor: '#f7f7f7' }}>
        <Container>
          <Row className="text-center">
            <Col xs={12} md={4} className="my-4 px-4">
              <h3>
                <BsFillPeopleFill className="icon me-2" />
                Effectifs réduits
              </h3>
              <div><BsDot className="icon" /></div>
              Les séances se déroulent en petit nombre, ceci pour permettre à la coach d'être attentive à vos postures.
            </Col>
            <Col xs={12} md={4} className="my-4 px-4">
              <h3>
                <BsStars className="icon me-2"/>
                Personnalisation
              </h3>
              <div><BsDot className="icon" /></div>
              Chaque séance est unique, la coach est à l'écoute de votre corps et va adapter les positions en fonction de votre physionomie, de votre âge et de votre expérience.
            </Col>
            <Col xs={12} md={4} className="my-4 px-4">
              <h3>
                <BsFillCalendarWeekFill className="icon me-2" />
                Flexibilité
              </h3>
              <div><BsDot className="icon" /></div>
              Chaque séance peut être choisie "à la carte" et ne vous engage pas sur la durée.
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Alert variant="primary">
                <BsFillInfoCircleFill className="icon me-2" />
                La première séance est gratuite, à la date de votre choix.
                {' '}
                <Link href="/inscription" passHref>
                  <Alert.Link>Je m'inscris</Alert.Link>
                </Link>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    </PublicLayout>
  )
}

Home.getInitialProps = ({ pathname })  => {
  return { pathname };
}
