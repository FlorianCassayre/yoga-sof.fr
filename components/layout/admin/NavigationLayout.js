import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { Col, Container, Dropdown, Nav, Row } from 'react-bootstrap';
import { BsBoxArrowRight, BsBoxArrowUpRight, BsCalendarWeek, BsCurrencyEuro, BsJournalText, BsKanban, BsMailbox, BsPeople, BsPerson, BsShieldLock } from 'react-icons/bs';
import pkg from '../../../package.json';

function NavItem({ children, className = '' }) {
  return <Nav.Item className={`mb-2 me-2 flex-grow-1 w-100 text-center text-sm-start ${className}`}>{children}</Nav.Item>;
}

function NavItemLink({ pathname: pathnameOther, icon: Icon, title, exactPathname, disabled }) {
  const { pathname } = useRouter();

  return (
    <NavItem>
      <Link href={pathnameOther} passHref>
        <Nav.Link active={exactPathname ? pathnameOther === pathname : pathname.startsWith(pathnameOther)} className="px-2 py-1 px-sm-3 py-sm-2" disabled={disabled}>
          <span className="d-sm-inline link-light">
            <Icon className="icon" />
            <span className="ms-2 d-none d-sm-inline">{title}</span>
          </span>
        </Nav.Link>
      </Link>
    </NavItem>
  );
}

function NavItemTitle({ title }) {
  return (
    <NavItem className="d-none d-sm-block">
      <div className="text-muted mt-2">{title}</div>
    </NavItem>
  );
}

export function NavigationLayout({ children }) {
  const router = useRouter();
  const { data: sessionData } = useSession();

  const handleSignOut = () => {
    signOut({ redirect: false, callbackUrl: '/' }).then(data => router.push(data.url));
  };

  return (
    <Container fluid>
      <Row>
        <Col id="admin-menu" xs={12} sm={5} md={4} lg={3} xl={2} className="px-sm-2 px-0 bg-dark d-flex">
          <div className="d-flex flex-sm-column flex-row flex-grow-1 align-items-center align-items-sm-start px-3 pt-3 pb-2 text-white" style={{ maxWidth: '100%' }}>
            <Link href="/administration" passHref>
              <a className="d-flex align-items-center mb-md-0 me-md-auto text-white text-decoration-none mb-2">
                {' '}
                {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                <span className="fs-5 d-none d-sm-inline">
                  Yoga Sof
                  <span className="text-muted fs-6 d-none d-sm-inline"> admin</span>
                </span>
              </a>
            </Link>

            <Nav
              variant="pills"
              className="w-100 flex-sm-column flex-row flex-nowrap flex-shrink-1 flex-sm-grow-0 flex-grow-1 mb-sm-auto justify-content-center align-items-center align-items-sm-start"
            >
              <Link href="/" passHref>
                <a className="link-light text-decoration-none mb-2 d-none d-sm-inline">
                  {' '}
                  {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
                  Revenir sur le site
                  <BsBoxArrowUpRight className="icon ms-2" />
                </a>
              </Link>
              <NavItemLink pathname="/administration" exactPathname icon={BsKanban} title="Aperçu" />
              <NavItemTitle title="Yoga" />
              <NavItemLink pathname="/administration/seances" icon={BsCalendarWeek} title="Séances et horaires" />
              <NavItemLink pathname="/administration/inscriptions" icon={BsJournalText} title="Inscriptions" />
              <NavItemLink pathname="/administration/paiements" icon={BsCurrencyEuro} title="Factures et paiements" disabled />
              <NavItemTitle title="Administration" />
              <NavItemLink pathname="/administration/administrateurs" icon={BsShieldLock} title="Administrateurs" />
              <NavItemLink pathname="/administration/utilisateurs" icon={BsPeople} title="Utilisateurs" />
              <NavItemLink pathname="/administration/emails" icon={BsMailbox} title="Emails" />
            </Nav>

            <div className="py-sm-4 mt-sm-auto ms-auto ms-sm-0 flex-shrink-1 mb-2 mb-sm-0">
              <Dropdown as={Nav.Item} className="">
                <Dropdown.Toggle as={Nav.Link} className="link-light">
                  <BsPerson className="icon" />
                  <span className="ms-2 d-none d-sm-inline">{sessionData.user.name}</span>
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={handleSignOut}>
                    <BsBoxArrowRight className="icon me-2" />
                    Déconnexion
                  </Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
              <div className="text-muted d-none d-sm-block ms-3">
                Version
                {pkg.version}
              </div>
            </div>
          </div>
        </Col>
        <Col xs={12} sm={7} md={8} lg={9} xl={10} className="d-flex flex-column">
          <Row as="main" className="overflow-auto">
            <Col className="p-4">{children}</Col>
          </Row>
          {/* <Row as="footer" className="bg-light py-4 mt-auto">
            <Col>Footer</Col>
          </Row> */}
        </Col>
      </Row>
    </Container>
  );
}
