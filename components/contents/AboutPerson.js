import { Col, Image, Row } from 'react-bootstrap';

function CertificationLogos({ certifications }) {
  const isString = s => typeof s === 'string' || s instanceof String;

  return certifications.map(({ src, alt, href, className = '' }) => {
    const commonProps = {
      width: '125px',
      className: `logo-bw ${className}`,
    };
    const Cmp = src;
    return (
      <a key={href} href={href} target="_blank" rel="noreferrer">
        {isString(src) ? (
          <Image {...commonProps} src={src} alt={alt} />
        ) : (
          <Cmp {...commonProps} />
        )}
      </a>
    );
  });
}

export function AboutPerson({ personImageSrc, personName, personTitle, certifications, children }) {
  return (
    <Row className="mt-4">
      <Col xs={12} sm={12} md={5} lg={4} xl={3} className="px-5 px-md-4 pb-4">
        <Image src={personImageSrc} alt={personName} fluid className="rounded-circle shadow mb-3" />
        <div className="text-center">
          <strong>{personName}</strong>
          <span className="d-block text-muted">{personTitle}</span>
        </div>
      </Col>
      <Col xs={12} sm={12} md={7} lg={8} xl={9} className="text-justify">
        {children}
      </Col>
      <Col xs={12} className="text-center mt-3">
        <CertificationLogos certifications={certifications} />
      </Col>
    </Row>
  );
}
