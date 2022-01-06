import { Col, Container, Nav, Row } from 'react-bootstrap';

export function NavigationLayout({ pathname, children }) {
  return (
    <Container fluid className="overflow-hidden">
      <Row className="vh-100 overflow-auto">
        <Col xs={12} sm={3} xl={2} className="px-sm-2 px-0 bg-dark d-flex sticky-top">
          <div
            className="d-flex flex-sm-column flex-row flex-grow-1 align-items-center align-items-sm-start px-3 pt-2 text-white">
            <a href="/"
               className="d-flex align-items-center pb-sm-3 mb-md-0 me-md-auto text-white text-decoration-none">
              <span className="fs-5">B<span className="d-none d-sm-inline">rand</span></span>
            </a>

            <Nav variant="pills" className="w-100 flex-sm-column flex-row flex-nowrap flex-shrink-1 flex-sm-grow-0 flex-grow-1 mb-sm-auto justify-content-center align-items-center align-items-sm-start">
              <Nav.Item className="mb-2 me-2 flex-grow-1 w-100">
                <Nav.Link href="/home" active>
                  <span className="ms-1 d-sm-inline">Home</span>
                </Nav.Link>
              </Nav.Item>
              <Nav.Item className="mb-2 me-2 flex-grow-1 w-100">
                <Nav.Link href="/home" active>
                  <span className="ms-1 d-sm-inline">Home</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <div className="dropdown py-sm-4 mt-sm-auto ms-auto ms-sm-0 flex-shrink-1">
              <a href="#" className="d-flex align-items-center text-white text-decoration-none dropdown-toggle"
                 id="dropdownUser1" data-bs-toggle="dropdown" aria-expanded="false">
                  <span className="d-none d-sm-inline mx-1">Joe</span>
              </a>
              <ul className="dropdown-menu dropdown-menu-dark text-small shadow" aria-labelledby="dropdownUser1">
                <li><a className="dropdown-item" href="#">New project...</a></li>
                <li><a className="dropdown-item" href="#">Settings</a></li>
                <li><a className="dropdown-item" href="#">Profile</a></li>
                <li>
                  <hr className="dropdown-divider"/>
                </li>
                <li><a className="dropdown-item" href="#">Sign out</a></li>
              </ul>
            </div>
          </div>
        </Col>
        <Col className="d-flex flex-column h-sm-100">
          <Row as="main" className="overflow-auto">
            <Col className="pt-4">
              {children}
            </Col>
          </Row>
          {/*<Row as="footer" className="bg-light py-4 mt-auto">
            <Col>Footer</Col>
          </Row>*/}
        </Col>
      </Row>
    </Container>
  );
}
