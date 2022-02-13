import { Container } from 'react-bootstrap';
import { PublicLayout } from '../components/layout/public';

export default function ReglementInterieur({ pathname }) {
  return (
    <PublicLayout pathname={pathname} padNavbar title="Règlement intérieur">
      <Container className="p-4">
        <h1>Règlement intérieur</h1>
        <p>
          Règlement Intérieur Yoga Sof pour les cours de Yoga adulte.
        </p>
        <h2 className="h4">1 – Objet</h2>
        <p>
          L'objet est de faire connaître et transmettre l'esprit du yoga lors de séances en petits groupes, dans une atmosphère agréable et bienveillante.
        </p>

        <h2 className="h4">2 – Ethique</h2>
        <p>
          Les pratiquants s'engagent à respecter une éthique basée sur la non-violence et la bienveillance.
        </p>

        <h2 className="h4">3 – Organisation des cours</h2>
        <p>
          Les cours se déroulent sur l'année scolaire et n'ont pas lieu durant les vacances scolaires.
        </p>
        <p>
          Il est possible de choisir ses cours à la carte, cependant si vous souhaiter intégrer un groupe, il est recommandé de venir pratiquer le même jour et sur le même créneau. Il est également recommandé de suivre une séance par semaine pour en tirer des bénéfices et progresser.
        </p>
        <p>
          Il est demandé d'être ponctuel.
        </p>
        <p>
          Veuillez ôter vos chaussures à l'entrée, ne pas amener de nourriture, mettre votre téléphone en mode avion.
        </p>

        <h2 className="h4">4 – Absence de l'enseignante</h2>
        <p>
          En cas d'évènement indépendant de sa volonté nécessitant l'annulation de la séance, les adhérents seront prévenus dans les meilleurs délais.
        </p>

        <h2 className="h4">5 - Crise sanitaire</h2>
        <p>
          La salle étant privée, elle n'est pas concernée par les fermetures officielles des salles de sport. Cependant en cas de doute sur votre état de santé ou bien si vous êtes cas contact, merci de vous désinscrire de la séance à venir dans les meilleurs délais, il ne vous sera pas facturé.
        </p>

        <h2 className="h4">6 – Droit à l'image</h2>
        <p>
          Afin d'illustrer les activités Yoga pour le site internet, vous êtes susceptibles d'être photographiés ou filmés lors d'un cours. Merci de vous signaler en cas de refus, la signature de ce document engageant votre accord.
        </p>
      </Container>
    </PublicLayout>
  )
}

ReglementInterieur.getInitialProps = ({ pathname })  => {
  return { pathname };
}
