import Link from 'next/link';
import { Button, Col, Image, Row } from 'react-bootstrap';
import {
  BsClockFill,
  BsFillInfoCircleFill,
  BsFillPeopleFill, BsGiftFill,
  BsMoonStarsFill, BsPencilSquare,
} from 'react-icons/bs';

export const practicalInformationsAdult = {
  section: 'adulte',
  age: 'Adultes',
  level: 'Tous',
  group: '4 personnes',
  duration: '1h15',
  place: `À mon domicile au 8 rue des moissonneurs à Hésingue. Je peux également venir chez vous si vous constituez un petit groupe, n'hésitez pas à me contacter pour cela.`,
  material: 'Tapis de Yoga et une couverture, portez une tenue confortable. Vous pourrez emprunter sur place des blocs, sangles, coussins, balles et ballons.',
  image2: '/images/interieur-debout.jpg',
  program: (
    <>
      <p>
        J'enseigne un hatha Yoga respectueux de la physiologie de votre corps, en petit groupe convivial de 4 personnes, à Hésingue. Dès que nécessaire durant la séance, je vous proposerai des adaptations individuelles des postures à l'aide d'accessoires ou de variantes pour vous aider à développer votre force et votre souplesse sans inconfort, ni risque de blessure car selon moi, les postures doivent s'adapter à la personne, à sa morphologie et non l'inverse.
      </p>
      <p>
        Mes séances sont progressives et incluent tous les outils du Yoga ; postures, pranayamas, relaxations ainsi qu'un travail mental pour vous amener à vous détendre et ressentir les bienfaits de votre pratique, ainsi progresser sur le chemin de la connaissance de votre moi.
      </p>
      <p>
        La première séance est offerte.
      </p>
    </>
  ),
  characteristic: 'Respect de votre morphologie',
  registrable: true,
};

export const practicalInformationsChildren = {
  section: 'enfant',
  age: '6 à 11 ans',
  level: 'Initiation',
  group: '6 enfants',
  duration: '1h',
  dates: 'Une fois par semaine sauf vacances scolaires',
  place: 'La Comète 16 Rue du 20 Novembre, 68220 Hésingue',
  material: `Venir en tenue souple et confortable qui ne serre pas au niveau de l'abdomen, tapis de yoga et couverture.`,
  registration: `Informations ou inscriptions me contacter pour une première séance d'essai offerte`,
  image2: '/images/bouda-tailleur.jpg',
  program: (
    <>
      <p>
        J'inviterai à entrer en contact avec le monde à travers leurs corps, en jouant et en créant. Par la symbolique des postures, sa conscience du corps va augmenter : il jouera à être un animal, un élément de la nature, un héros. Ce jeu le conduit vers la méditation, car ses pensées sont parfaitement concentrées sur ce qu'il “est” dans l'instant sans qu'aucune autre ne perturbe cet état.
      </p>
      <p>
        J'aurai du plaisir à leur conter les légendes du Yoga, à jouer avec eux à toutes sortes de jeux statiques ou dynamiques, à créer des manadala, à chanter… Les postures seront les prétextes pour aborder la respiration par l'attitude juste du corps, celle qui favorise une respiration naturelle et libre. Je les amènerai à prendre conscience qu'une posture équilibrée induit des émotions positives et une respiration physiologique, complète et naturelle.
      </p>
      <p>
        L'attention des enfants sera attirée sur l'importance de cette attitude dans la vie quotidienne, en lien avec l'état de bien Etre.
      </p>
      <p>
        Je leur proposerai d'observer leur jardin intérieur car ils sont les seuls à pouvoir le connaître. L'intériorisation s'acquiert petit à petit, elle permet de développer la notion de “témoin”, d'observer ses émotions, son attitude, sa position. En s'entraînant à “voir” ses réactions, l'enfant va pouvoir agir sur son comportement, puis ne plus être submergé par la vague de l'émotion.
      </p>
      <p>
        Le Yoga est une voie d'éveil, d'exploration à l'intérieur de soi-même, d'expression et de sagesse.
      </p>
      <p>
        Transmis de manière ludique et dans un esprit de coopération, il sera comme une heure d'effort et d'exploration sans performance, sans comparaison, ni compétition, dans la joie.
      </p>
      <p>
        Bien que chaque séance soit différente, elle se déroulera selon les étapes suivantes :
      </p>
      <ul>
        <li>Accueil, météo intérieure</li>
        <li>Préparation, centrage ou lecture d'un conte pour introduire une thématique</li>
        <li>Mise en mouvement du corps : postures, enchaînements, déplacement dans l'espace, chansons, automassages et respirations…</li>
        <li>Postures à 2, collaboration</li>
        <li>Retour au calme, relaxation</li>
        <li>Rituel de fin, partage, échanges</li>
      </ul>
    </>
  ),
  price: `90€/ trimestre et cotisation 20€/ an pour l'association Zing & Zen`,
  registrable: false,
};

export const practicalInformationsParentChildren = {
  section: 'parent-enfant',
  age: '3 à 6 ans',
  level: 'Initiation',
  group: '6 duos',
  duration: '1h',
  dates: 'Une fois tous les 15j sauf vacances scolaires',
  place: 'La Comète 16 Rue du 20 Novembre, 68220 Hésingue',
  material: `Venir en tenue souple et confortable qui ne sert pas au niveau de l'abdomen, apporter un ou mieux, deux tapis de yoga et une couverture.`,
  registration: `Informations ou inscriptions me contacter pour une première séance d'essai offerte`,
  image2: '/images/yoga-enfant-arbre-plage.jpg',
  program: (
    <>
      <p>
        Le Yoga parent-enfant permet à un duo composé d'un parent, grand-parent ou autre adulte référent accompagné d'un ou deux enfants entre 3 et 6 ans de partager un moment de complicité. La parent trouvera du plaisir à mettre son corps en mouvement ou bien se détendre, se laisser guider dans sa pratique de yoga. Il pourra en même temps offrir à son enfant un environnement protecteur et s'ouvrir à sa créativité et sa joie de vivre. Alors que certains exercices permettront aux enfants de développer leur concentration, d'autres postures de yoga réalisées en duo, parfois acrobatiques et parfois relaxantes, approfondiront votre lien de confiance mutuel.
      </p>
      <p>
        Il n'est pas nécessaire pour le parent d'être pratiquant de yoga.
      </p>
      <p>
        C'est l'occasion idéale pour partager de précieux moments avec votre enfant, un petit rituel à vous deux.
      </p>
    </>
  ),
  price: `90€/ trimestre pour un duo et cotisation 20€/ an pour l'association Zing & Zen maximum 6 duos par cours`,
  registrable: false,
};

export function PracticalInformations({ data: { section, age, level, group, duration, place, material, registration, program, image2, registrable, dates }, condensed }) {
  const AttributeIcon = ({ icon: Icon, title, value }) => (
    <div className="mb-2">
      <Icon className="icon me-2" />
      <strong className="h5">{title}</strong>
      <br />
      <span>{value}</span>
    </div>
  );

  return (
    <Row className="mt-4 text-center">
      <Col xs={6} sm={3}>
        <AttributeIcon icon={BsGiftFill} title="Âge" value={age} />
      </Col>
      <Col xs={6} sm={3}>
        <AttributeIcon icon={BsMoonStarsFill} title="Niveau" value={level} />
      </Col>
      <Col xs={6} sm={3}>
        <AttributeIcon icon={BsFillPeopleFill} title="Groupe" value={group} />
      </Col>
      <Col xs={6} sm={3}>
        <AttributeIcon icon={BsClockFill} title="Durée" value={duration} />
      </Col>
      {condensed ? (
        <Col xs={12}>
          <Link href={`/seances#${section}`}>
            <Button variant="primary" className="shadow mt-3 mx-2">
              <BsFillInfoCircleFill className="icon me-2" />
              Informations pratiques
            </Button>
          </Link>
          {registrable && (
            <Link href="/inscription">
              <Button variant="success" className="shadow mt-3">
                <BsPencilSquare className="icon me-2 mx-2" />
                Inscription
              </Button>
            </Link>
          )}
        </Col>
      ) : (
        <>
          <Col xs={12} sm={8} className="mt-4 text-start">
            <ul>
              {dates && (
                <li>
                  <strong>Dates :</strong> {dates}
                </li>
              )}
              <li>
                <strong>Lieu :</strong> {place}
              </li>
              <li>
                <strong>Matériel à amener :</strong> {material}
              </li>
              {registration && (
                <li>
                  <strong>Inscription :</strong> {registration}
                </li>
              )}
            </ul>
            {program}
          </Col>
          <Col xs={12} sm={4} className="mt-4 px-5 px-sm-2 px-md-4">
            <Image src={image2} fluid className="rounded-3 shadow" />
          </Col>
        </>
      )}
    </Row>
  );
}
