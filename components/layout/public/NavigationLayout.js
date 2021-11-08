import Link from 'next/link';
import { Button, Container, Nav, Navbar } from 'react-bootstrap';
import { BsPencilSquare } from 'react-icons/bs';
import { GrYoga } from 'react-icons/gr';

export function NavigationLayout({ pathname }) {

  const propsForPathname = pathnameOther => pathnameOther === pathname ? { active: true, className: 'navbar-page-active' } : {};

  const NavLink = ({ pathname: pathnameOther, children }) => (
    <Link href={pathnameOther} passHref>
      <Nav.Link {...propsForPathname(pathnameOther)}>{children}</Nav.Link>
    </Link>
  );

  return (
    <Navbar bg="light" fixed="top" expand="md" className="shadow" style={{ '--bs-bg-opacity': 0.95 }}>
      <Container>
        <Link href="/" passHref>
          <Navbar.Brand>
            <GrYoga className="icon me-2" />
            Yoga Sof
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto text-center">
            <NavLink pathname="/">
              Accueil
            </NavLink>
            <NavLink pathname="/yoga">
              Le yoga
            </NavLink>
            <NavLink pathname="/seances">
              Les séances
            </NavLink>
            <NavLink pathname="/a-propos">
              À propos
            </NavLink>
          </Nav>
          <Nav>
            <Link href="/inscription">
              <Button disabled={pathname === '/inscription'}>
                <BsPencilSquare className="icon me-2" />
                Je m'inscris à une séance
              </Button>
            </Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}