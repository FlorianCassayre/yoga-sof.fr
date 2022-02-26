import { Col, Container, Image, Row } from 'react-bootstrap';
import { RiDoubleQuotesL, RiDoubleQuotesR } from 'react-icons/ri';
import { IconEye, IconFidhy } from '../components/icons';
import { PublicLayout } from '../components/layout/public';

export default function APropos() {
  return (
    <PublicLayout padNavbar title="À propos">
      <Container className="p-4">
        <h1 className="mb-4">À propos</h1>
        <Row>
          <Col xs={12} sm={12} md={5} lg={4} xl={3} className="px-5 px-md-4 pb-4">
            <Image src="/images/portrait.jpg" alt="Sophie Richaud-Cassayre" fluid className="rounded-circle shadow mb-3" />
            <div className="text-center">
              <strong>Sophie Richaud-Cassayre</strong>
              <span className="d-block text-muted">Enseignante de Yoga</span>
            </div>
          </Col>
          <Col xs={12} sm={12} md={7} lg={8} xl={9} className="text-justify">
            <p>
              <RiDoubleQuotesL className="icon me-2" />
              Après 25 d'expérience dans le numérique, et avoir animé des ateliers connectés pour les enfants, je me suis reconvertie dans le Yoga. J'enseigne exclusivement pour des petits groupes
              afin de pouvoir adapter et personnaliser les postures car j'ai à cœur de proposer une pratique sûre, respectueuse de la physiologie, des morphologies et des possibilités de chacun.
              Consciente de l'importance de la biomécanique, je me suis formée et j'applique l'Approche Posturo-Respiratoire selon Bernadette De Gasquet, qui s'appuie sur les liens qui existent entre
              la posture, la respiration et le périnée pour renforcer la sangle abdominale et les muscles profonds. Je commencerai donc par corriger le placement de mes élèves dans les postures de
              base car la respiration en dépend. Puis lors de toutes postures, je guiderai de manière à toujours éloigner les épaules du bassin afin de limiter les pressions sur le périnée et les
              conséquences délétères qui en résultent sur l'ensemble du corps. Je vous aiderai le cas échéant à adapter les postures de manière à prendre en compte votre morphologie. Mes pratiquants
              seront également autonomisés pour adapter par eux-même les postures pour tous les moments de la vie.
              <RiDoubleQuotesR className="icon ms-2" />
            </p>
            <p>
              J'adhère au Code d'Éthique et de Déontologie des enseignants de Yoga et suis rattachée à la Fidhy (Fédérération Inter-enseignements de Hatha Yoga), elle-même membre de l'Union Européenne
              de Yoga.
            </p>
            <h2 className="h5">Mes diplômes et certificats</h2>
            <ul>
              <li>2022 : Institut De Gasquet, Yoga sans dégâts (70 heures)</li>
              <li>2020 : École de Yoga de l'Énergie, Formation d'enseignante de Yoga enfants et parents-enfants avec Nathalie Hérault et Agnès Bulté (80 heures sur 1 an)</li>
              <li>2019-2022 : École de Yoga de l'Énergie Formation d'enseignante de Yoga (636 heures sur 4 ans)</li>
              <li>1995 : EPF Engineering school, Ingénieur réseaux et télécoms</li>
            </ul>
          </Col>
          <Col xs={12} className="text-center mt-3">
            <a href="https://www.fidhy.fr/" target="_blank" rel="noreferrer">
              <IconFidhy width="125px" className="logo-bw" />
            </a>
            <a href="https://www.yoga-energie.fr/" target="_blank" rel="noreferrer">
              <IconEye width="125px" className="logo-bw" />
            </a>
            <a href="https://www.degasquet.com/" target="_blank" rel="noreferrer">
              <Image src="/images/logo-certifications-yoga-de-gasquet.png" alt="Certifications Yoga de Gasquet" width="125px" className="logo-bw mx-4" />
            </a>
          </Col>
        </Row>
      </Container>
    </PublicLayout>
  );
}
