import { Col, Container, Image, Row } from 'react-bootstrap';
import { RiDoubleQuotesL, RiDoubleQuotesR } from 'react-icons/ri';
import { PublicLayout } from '../components/layout/public';

export default function Yoga({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar>
      <Container className="p-4">
        <h1>Le Yoga</h1>
        <p className="text-justify">
          Le Yoga est une recherche d'équilibre entre tonus et détente, entre droite et gauche, entre flexion et extension.
          Par des postures correctement préparées, guidées et adaptées, nous cherchons à mieux nous connaître, à voir ce qui est faible dans votre corps, pour le renforcer, identifier ce qui rétracté et le détendre, le tout avec un minimum de tension, avec confort, mais sans relâchement.
          Une fois atteint la posture juste, c'est-à dire dans laquelle le diaphragme est libéré, le souffle est libre, vous vous installerez dans cette posture pour la tenir.
          Vous serez attentifs à observer notre esprit, à vous débarrasser des tensions comportementales et émotionnelles, vous apprendrez à mieux vous détendre.
          Par l'expérience de la conscience qui est à l'intérieur, vous développerez une attitude de l'être.
        </p>


        <figure className="text-center">
          <blockquote className="blockquote">
            <p className="mb-0">
              <em>
                Sthira-sukham asanam
              </em>
            </p>
            <p className="h6">
              "Être fermement établi dans un espace heureux"
            </p>
          </blockquote>
          <figcaption className="blockquote-footer">
            <cite title="Yoga sutra">Yoga sutra 46/II</cite>
          </figcaption>
        </figure>

        <p className="text-justify">
          Le Yoga permet de diminuer les tensions de notre corps mais également l'anxiété et le stress.
          C'est grâce à cette pratique que l'on peut aider à réguler ses émotions, chose qui, aujourd'hui dans la vie quotidienne est indispensable.
        </p>

        <Row className="justify-content-center">
          <Col xs={12} md={10} lg={8} xl={6}>
            <Image src="/images/meditation-australie.jpg" fluid className="rounded-3 shadow mb-3" />
          </Col>
        </Row>

      </Container>
    </PublicLayout>
  );
}

Yoga.getInitialProps = ({ pathname })  => {
  return { pathname };
}
