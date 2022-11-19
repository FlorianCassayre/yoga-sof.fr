import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Container, Nav, NavDropdown, Navbar, Spinner } from 'react-bootstrap';
import { BsBoxArrowRight, BsCalendarWeek, BsPencilSquare, BsPerson, BsSpeedometer2 } from 'react-icons/bs';
// import { GrYoga } from 'react-icons/gr';
import { IconYoga } from '../../icons';
import { USER_TYPE_ADMIN } from '../../../lib/common';

function NavLink({ pathname: pathnameOther, children }) {
  const { pathname } = useRouter();

  const linkProps = pathnameOther === pathname ? { active: true, className: 'navbar-page-active' } : {};

  return (
    <Link href={pathnameOther} passHref>
      <Nav.Link {...linkProps}>{children}</Nav.Link>
    </Link>
  );
}

function NavBarToggler(props) {
  return (
    <button type="button" style={{ border: 'none' }} {...props}>
      <span className="navbar-toggler-icon" />
    </button>
  );
}

export function NavigationLayout() {
  const { data: session, status: sessionStatus } = useSession();
  const sessionLoading = sessionStatus === 'loading';

  const handleSignOut = () => {
    signOut({ redirect: true, callbackUrl: '/' });
  };

  return (
    <Navbar bg="light" fixed="top" expand="md" className="shadow" style={{ '--bs-bg-opacity': 0.95 }}>
      <Container>
        <Link href="/" passHref>
          <Navbar.Brand>
            <IconYoga className="icon me-2" />
            Yoga Sof
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle
          aria-controls="responsive-navbar-nav"
          as={NavBarToggler}
        />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto text-center">
            <NavLink pathname="/">Accueil</NavLink>
            <NavLink pathname="/yoga">Le Yoga</NavLink>
            <NavLink pathname="/seances">Les séances</NavLink>
            <NavLink pathname="/inscription">Inscription</NavLink>
            <NavLink pathname="/a-propos">À propos</NavLink>
          </Nav>
          <Nav className="text-center">
            {sessionLoading ? (
              <Spinner animation="border" />
            ) : session ? (
              <NavDropdown
                title={(
                  <>
                    <BsPerson className="icon me-2" />
                    {session.displayName || 'Mon compte'}
                  </>
                )}
                id="nav-dropdown"
              >
                {session.userType === USER_TYPE_ADMIN && (
                  <>
                    <Link href="/index" passHref>
                      <NavDropdown.Item>
                        <BsSpeedometer2 className="icon me-2" />
                        Administration
                      </NavDropdown.Item>
                    </Link>
                    <NavDropdown.Divider />
                  </>
                )}
                <Link href="/inscription" passHref>
                  <NavDropdown.Item>
                    <BsPencilSquare className="icon me-2" />
                    Inscription à une séance
                  </NavDropdown.Item>
                </Link>
                <Link href="/mes-inscriptionsOld" passHref>
                  <NavDropdown.Item>
                    <BsCalendarWeek className="icon me-2" />
                    Mes inscriptions
                  </NavDropdown.Item>
                </Link>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleSignOut}>
                  <BsBoxArrowRight className="icon me-2" />
                  Déconnexion
                </NavDropdown.Item>
              </NavDropdown>
            ) : (
              <NavLink pathname="/connexion">Connexion</NavLink>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}
