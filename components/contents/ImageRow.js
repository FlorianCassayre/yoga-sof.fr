import { Col, Image, Row } from 'react-bootstrap';

export function ImageRow({ src, alt }) {
  return (
    <Row className="justify-content-center">
      <Col xs={12} md={10} lg={8} xl={6}>
        <Image src={src} alt={alt} fluid className="rounded-3 shadow mb-3" />
      </Col>
    </Row>
  );
}
