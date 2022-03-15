import Link from 'next/link';
import { Button, Col, Image, Row } from 'react-bootstrap';
import { BsClockFill, BsFillInfoCircleFill, BsFillPeopleFill, BsGiftFill, BsMoonStarsFill, BsPencilSquare } from 'react-icons/bs';

function AttributeIcon({ icon: Icon, title, value }) {
  return (
    <div className="mb-2">
      <Icon className="icon me-2" />
      <strong className="h5">{title}</strong>
      <br />
      <span>{value}</span>
    </div>
  );
}

export function PracticalInformations({ data: { section, age, level, group, duration, place, material, registration, image2, registrable, dates }, condensed, children }) {
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
          <Link href={`/seances#${section}`} passHref>
            <Button variant="primary" className="shadow mt-3 mx-2">
              <BsFillInfoCircleFill className="icon me-2" />
              Informations pratiques
            </Button>
          </Link>
          {registrable && (
            <Link href="/inscription" passHref>
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
                  <strong>Dates :</strong>
                  {' '}
                  {dates}
                </li>
              )}
              <li>
                <strong>Lieu :</strong>
                {' '}
                {place}
              </li>
              <li>
                <strong>Matériel à amener :</strong>
                {' '}
                {material}
              </li>
              {registration && (
                <li>
                  <strong>Inscription :</strong>
                  {' '}
                  {registration}
                </li>
              )}
            </ul>
            {children}
          </Col>
          <Col xs={12} sm={4} className="mt-4 px-5 px-sm-2 px-md-4">
            <Image src={image2} alt="Photo d'illustration" fluid className="rounded-3 shadow" />
          </Col>
        </>
      )}
    </Row>
  );
}
