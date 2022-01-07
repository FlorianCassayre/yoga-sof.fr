import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Col, Container, Dropdown, Nav, Navbar, NavDropdown, Row } from 'react-bootstrap';
import { BsBoxArrowRight, BsBoxArrowUpRight, BsKanban, BsLock, BsShieldLock, BsSpeedometer2 } from 'react-icons/bs';

export function NavigationLayout({ pathname, children }) {

  const router = useRouter();
  const { data: sessionData } = useSession();

  const handleSignOut = () => {
    signOut({ redirect: false, callbackUrl: '/' }).then(data => router.push(data.url));
  };

  const NavItem = ({ children }) => (
    <Nav.Item className="mb-2 me-2 flex-grow-1 w-100">
      {children}
    </Nav.Item>
  );

  const NavItemLink = ({ pathname: pathnameOther, children }) => (
    <NavItem>
      <Link href={pathnameOther} passHref>
        <Nav.Link active={pathnameOther === pathname}>
          <span className="ms-1 d-sm-inline link-light">
            {children}
          </span>
        </Nav.Link>
      </Link>
    </NavItem>
  );

  const NavItemTitle = ({ children }) => (
    <NavItem>
      <div className="text-muted mt-2">
        {children}
      </div>
    </NavItem>
  );

  return (
    <Container fluid className="overflow-hidden">
      <Row className="vh-100 overflow-auto">
        <Col xs={12} sm={3} xl={2} className="px-sm-2 px-0 bg-dark d-flex sticky-top">
          <div className="d-flex flex-sm-column flex-row flex-grow-1 align-items-center align-items-sm-start px-3 pt-3 pb-2 text-white">
            <Link href="/administration" passHref>
              <a className="d-flex align-items-center mb-md-0 me-md-auto text-white text-decoration-none">
                <span className="fs-5">Y<span className="d-none d-sm-inline">oga </span>S<span className="d-none d-sm-inline">of</span><span className="text-muted fs-6 d-none d-md-inline"> admin</span></span>
              </a>
            </Link>

            <Nav variant="pills" className="w-100 flex-sm-column flex-row flex-nowrap flex-shrink-1 flex-sm-grow-0 flex-grow-1 mb-sm-auto justify-content-center align-items-center align-items-sm-start">
              <Link href="/" passHref>
                <a className="link-light text-decoration-none mb-2">
                  Revenir sur le site
                  <BsBoxArrowUpRight className="icon ms-2" />
                </a>
              </Link>
              <NavItemTitle>
                Général
              </NavItemTitle>
              <NavItemLink pathname="/administration">
                <BsKanban className="icon me-2" />
                Aperçu
              </NavItemLink>
              <NavItemTitle>
                Administration
              </NavItemTitle>
              <NavItemLink pathname="/administration/admins">
                <BsShieldLock className="icon me-2" />
                Administrateurs
              </NavItemLink>
            </Nav>

            <Dropdown as={Nav.Item} className="py-sm-4 mt-sm-auto ms-auto ms-sm-0 flex-shrink-1">
              <Dropdown.Toggle as={Nav.Link} className="link-light">
                {sessionData.session.user.name}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={handleSignOut}>
                  <BsBoxArrowRight className="icon me-2" />
                  Déconnexion
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>

          </div>
        </Col>
        <Col className="d-flex flex-column h-sm-100">
          <Row as="main" className="overflow-auto">
            <Col className="p-4">
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
