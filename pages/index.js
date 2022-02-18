import { RiDoubleQuotesL, RiDoubleQuotesR } from 'react-icons/ri';
import { BsBoxArrowUpRight, BsDot, BsFillCalendarWeekFill, BsFillInfoCircleFill, BsFillPeopleFill, BsStars } from 'react-icons/bs';
import { Alert, Col, Container, Image, Row } from 'react-bootstrap';
import Link from 'next/link';
import { PublicLayout } from '../components/layout/public';
import { PracticalInformations, practicalInformationsAdult, practicalInformationsChildren, practicalInformationsParentChildren } from '../components/PracticalInformations';

export default function Home() {
  function CourseCard({ alt, title, description, image, informationData, urlSection }) {
    const imageData = (
      <div className="text-center">
        <Image src={image} alt={title} fluid className="rounded-3 shadow" />
      </div>
    );
    const contentData = (
      <>
        <h2 className={'display-6 text-start' + ` ${alt ? 'text-lg-end' : ''}`}>{title}</h2>
        <div className="text-justify">
          {description}
          <PracticalInformations data={informationData} condensed />
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
    <PublicLayout title="Accueil">
      <div className="shadow header-image" style={{ width: '100%', height: '50vh', position: 'relative' }}>
        <div
          className="text-white text-center p-4"
          style={{ position: 'absolute', bottom: 0, width: '100%', textShadow: '2px 2px 4px #000000', zIndex: 100 }}
        >
          <h1 className="display-1">Yoga Sof</h1>
          <br />
          <span className="fs-2">Pratique du Yoga à Hésingue</span>
        </div>
      </div>

      <CourseCard
        title="Séances de Yoga adulte"
        description={(
          <>
            <p className="mb-0">
              J'enseigne un hatha Yoga respectueux de la physiologie de votre corps, en petit groupe convivial de 4 personnes, à Hésingue. Dès que nécessaire durant la séance, je vous proposerai des
              adaptations individuelles des postures à l'aide d'accessoires ou de variantes pour vous aider à développer votre force et votre souplesse sans inconfort, ni risque de blessure car selon
              moi, les postures doivent s'adapter à la personne, à sa morphologie et non l'inverse.
            </p>
            <p className="mb-0">
              Mes séances sont progressives et incluent tous les outils du Yoga ; postures, pranayamas, relaxations ainsi qu'un travail mental pour vous amener à vous détendre et ressentir les
              bienfaits de votre pratique, ainsi progresser sur le chemin de la connaissance de votre moi.
            </p>
            <p className="mb-0">La première séance est offerte.</p>
          </>
        )}
        image="/images/arbre-ocean.jpg"
        informationData={practicalInformationsAdult}
        urlSection="adulte"
      />

      <div className="skewed-1" />

      <CourseCard
        title="Séances de Yoga enfant"
        description={(
          <p className="mb-0">
            J'anime des pratiques de Yoga ludiques et adaptées pour les enfants de 6-11 ans en petit groupe, à Hésingue. Elles sont une voie d'exploration, d'expression et de sagesse, un moyen
            bienveillant pour les enfants d'identifier leurs et étendre leurs frontières, d'améliorer la conscience d'eux-mêmes et des autres, développer leurs capacités à reconnaître et accueillir
            leurs pensées et leurs émotions. Les postures sont nommées sur la thématique de la nature pour renforcer les liens de l'enfant et la nature.
          </p>
        )}
        image="/images/yoga-enfants-plage.jpg"
        informationData={practicalInformationsChildren}
        urlSection="enfant"
        alt
      />

      <div className="skewed-2" />

      <CourseCard
        title="Séances de yoga parent-enfant"
        description={(
          <p className="mb-0">
            J'anime des ateliers de Yoga en tandem parent-enfant de 3-6 ans, en petits groupes à Hésingue. Je les propose comme un moment de partage et de complicité où l'adulte (le parent ou
            grand-parent) se laisse guider dans sa pratique avec l'enfant, une pause privilégiée à vivre loin de la dispersion et l'agitation du monde actuel. Il s'agit d'une approche ludique du yoga
            intégrant des petites histoires, contes ou chansons amusantes qui sollicite l'imaginaire et va renforcer le lien de l'adulte avec l'enfant.
          </p>
        )}
        image="/images/yoga-enfants-collaboration.jpg"
        informationData={practicalInformationsParentChildren}
        urlSection="parent-enfant"
      />

      <div className="shadow quote-image" style={{ width: '100%' }}>
        <div className="text-white p-4 text-center" style={{ width: '100%', textShadow: '1px 1px 4px black' }}>
          <blockquote className="blockquote">
            <RiDoubleQuotesL className="icon me-2" />
            C'est à travers l'alignement de mon corps que j'ai découvert l'alignement de mon esprit, de mon Être et de mon intelligence
            <RiDoubleQuotesR className="icon ms-2" />
          </blockquote>
          <em>Sri B.K.S Iyengar</em>
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
              <div className="mb-2">
                <BsDot className="icon" />
              </div>
              Les séances se déroulent en petit nombre.
            </Col>
            <Col xs={12} md={4} className="my-4 px-4">
              <h3>
                <BsStars className="icon me-2" />
                Personnalisation
              </h3>
              <div className="mb-2">
                <BsDot className="icon" />
              </div>
              Adaptation des postures par rapport à vos possibilités et votre morphologie.
            </Col>
            <Col xs={12} md={4} className="my-4 px-4">
              <h3>
                <BsFillCalendarWeekFill className="icon me-2" />
                Flexibilité
              </h3>
              <div className="mb-2">
                <BsDot className="icon" />
              </div>
              Les séances adultes peuvent être choisies "à la carte".
            </Col>
          </Row>
          <Row className="justify-content-center">
            <Col xs={12} sm={10} md={8} lg={6}>
              <Alert variant="primary" className="shadow">
                <BsFillInfoCircleFill className="icon me-2" />
                La première séance vous est offerte.
                {' '}
                <Link href="/inscription" passHref>
                  <Alert.Link>
                    Je m'inscris maintenant
                    <BsBoxArrowUpRight className="icon ms-2" />
                  </Alert.Link>
                </Link>
              </Alert>
            </Col>
          </Row>
        </Container>
      </div>
    </PublicLayout>
  );
}
