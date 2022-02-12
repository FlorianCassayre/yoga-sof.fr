import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Button, Container, Nav, Navbar, NavDropdown, Spinner } from 'react-bootstrap';
import {
  BsBoxArrowRight,
  BsCalendarWeek,
  BsPencilSquare,
  BsPerson,
  BsSpeedometer2,
} from 'react-icons/bs';
import { GrYoga } from 'react-icons/gr';
import { IconYoga } from '../../icons';
import { USER_TYPE_ADMIN } from '../../session';

export function NavigationLayout({ pathname }) {

  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const sessionLoading = sessionStatus === 'loading';

  const handleSignOut = () => {
    signOut({ redirect: false, callbackUrl: '/' }).then(data => router.push(data.url));
  };

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
            <IconYoga className="icon me-2" />
            Yoga Sof
          </Navbar.Brand>
        </Link>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" as={props => (
          <button type="button" style={{ border: 'none' }} {...props}>
            <span className="navbar-toggler-icon" />
          </button>
        )} />
        <Navbar.Collapse id="responsive-navbar-nav">
          <Nav className="me-auto text-center">
            <NavLink pathname="/">
              Accueil
            </NavLink>
            <NavLink pathname="/yoga">
              Le Yoga
            </NavLink>
            <NavLink pathname="/seances">
              Les séances
            </NavLink>
            <NavLink pathname="/a-propos">
              À propos
            </NavLink>
          </Nav>
          <Nav className="text-center">
            {sessionLoading ? (
              <Spinner animation="border" />
            ) : session ? (
              <NavDropdown title={(
                <>
                  <BsPerson className="icon me-2" />
                  {session.user.name}
                </>
              )} id="nav-dropdown">
                {session.userType === USER_TYPE_ADMIN && (
                  <>
                    <Link href="/administration" passHref>
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
                <Link href="/mes-inscriptions" passHref>
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
              <Link href="/inscription">
                <Button disabled={pathname === '/inscription'} className="shadow">
                  <BsPencilSquare className="icon me-2" />
                  Je m'inscris à une séance
                </Button>
              </Link>
            )}

          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}