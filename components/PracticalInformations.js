import Link from 'next/link';
import { Button, Col, Image, Row } from 'react-bootstrap';
import { BsClockFill, BsFillInfoCircleFill, BsFillPeopleFill, BsGiftFill, BsMoonStarsFill, BsPencilSquare } from 'react-icons/bs';
import { WEEKDAYS, parseTime, parsedTimeToMinutes } from '../lib/common';

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

export function PracticalInformations({ type, courseModels, data: { section, age, level, group, duration, place, material, registration, image2, price, registrable, dates }, condensed, children }) {
  const modelsByDaySorted = {};
  const courseModelsFiltered = (courseModels || []).filter(({ type: modelType }) => modelType === type);
  courseModelsFiltered.forEach(model => {
    if (!modelsByDaySorted[model.weekday]) {
      modelsByDaySorted[model.weekday] = [];
    }
    modelsByDaySorted[model.weekday].push(model);
  });
  const daysTimesSorted = Object.entries(modelsByDaySorted)
    .map(([key, value]) => [parseInt(key), value.sort(({ timeStart: a }, { timeStart: b }) => parsedTimeToMinutes(parseTime(a)) - parsedTimeToMinutes(parseTime(b)))])
    .sort(([a], [b]) => a - b)
    .map(([key, value]) => ({ weekday: WEEKDAYS[key], times: value.map(({ timeStart, timeEnd }) => ({ timeStart, timeEnd })) }));
  const uniquePrices = [...new Set(courseModelsFiltered.map(({ price: thisPrice }) => thisPrice))];
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
              <li>
                <strong>Dates :</strong>
                {' '}
                {daysTimesSorted.length > 0 ? (
                  // eslint-disable-next-line
                  daysTimesSorted.map(({ weekday, times }) => [weekday.toLowerCase(), times.map(({ timeStart, timeEnd }) => ['de', timeStart.replace(':', 'h'), 'à', timeEnd.replace(':', 'h')].join(' ')).join(' et ')].join(' ')).join(' ; ')
                ) : dates}
              </li>
              {(price || courseModelsFiltered.length > 0) && (
                <li>
                  <strong>Tarif :</strong>
                  {' '}
                  {price || (
                    uniquePrices.length > 1 ? `${Math.min(...uniquePrices)} € à ${Math.max(...uniquePrices)} €` : `${uniquePrices[0]} €`
                  )}
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
