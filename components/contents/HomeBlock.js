import { Col, Container, Image, Row } from 'react-bootstrap';
import { PracticalInformations } from '../PracticalInformations';

function HomeBlock({ alt, title, children, imageSrc, data }) { // eslint-disable-line no-unused-vars
  const imageData = (
    <div className="text-center">
      <Image src={imageSrc} alt={title} fluid className="rounded-3 shadow" />
    </div>
  );
  const contentData = (
    <>
      <h2 className={`display-6 text-start ${alt ? 'text-lg-end' : ''}`}>{title}</h2>
      <div className="text-justify">
        {children}
        <PracticalInformations data={data} condensed />
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

export function HomeBlockFirst(props) {
  return <HomeBlock {...props} />;
}

export function HomeBlockSecond(props) {
  return (
    <>
      <div className="skewed-1" />
      <HomeBlock {...props} alt />
    </>
  );
}

export function HomeBlockThird(props) {
  return (
    <>
      <div className="skewed-2" />
      <HomeBlock {...props} />
    </>
  );
}
