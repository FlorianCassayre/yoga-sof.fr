import React, { Fragment, useEffect, useState } from 'react';
import {
  Box,
  Button,
  Collapse,
  Container,
  Divider,
  Grid, IconButton,
  Link as MuiLink, ListItemIcon, ListItemText, Menu, MenuItem,
  Skeleton,
  Stack,
  Toolbar,
} from '@mui/material';
import { Menu as MenuIcon, Person } from '@mui/icons-material';
import CssBaseline from '@mui/material/CssBaseline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMedia } from 'react-use';

interface MenuTitleProps {
  logo: React.ReactElement;
  title: string;
  titleUrl: string;
}

const MenuTitle: React.FC<MenuTitleProps> = ({ logo, title, titleUrl }) => {
  return (
    <Link href={titleUrl} passHref>
      <MuiLink
        variant="h5"
        color="inherit"
        noWrap
        sx={{ pr: 2, flexShrink: 0, textDecoration: 'none' }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {logo}
          <Box>
            {title}
          </Box>
        </Stack>
      </MuiLink>
    </Link>
  );
};

interface Section {
  title: string;
  url: string;
}

interface ProfileMenuItem {
  title: string;
  icon: JSX.Element;
  url?: string;
  onClick?: () => void;
}

interface ProfileMenuCategory {
  children: ProfileMenuItem[];
}

interface ProfileMenu {
  title: string;
  children: ProfileMenuCategory[];
}

interface MenuSectionsProps {
  sections: Section[];
}

const MenuSections: React.FC<MenuSectionsProps> = ({ sections }) => {
  const router = useRouter();
  return (
    <>
      {sections.map(({ title, url }, i) => (
        <Link
          key={i}
          href={url}
          passHref
        >
          <MuiLink
            color="inherit"
            noWrap
            variant="body2"
            sx={{ p: 1, flexShrink: 0, textDecoration: url === router.pathname ? undefined : 'none' }}
          >
            {title}
          </MuiLink>
        </Link>
      ))}
    </>
  );
};

interface ProfileMenuButtonProps {
  profile?: ProfileMenu | null;
  signInUrl: string;
}

const ProfileMenuButton: React.FC<ProfileMenuButtonProps> = ({ profile, signInUrl }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const isProfileOpen = !!anchorEl;
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const router = useRouter();

  return (
    <Grid container justifyContent="flex-end">
      {profile === undefined ? (
        <Skeleton variant="text" width={150} />
      ) : profile === null ? (
        <Link href={signInUrl} passHref>
          <Button variant="outlined" size="small">
            Connexion
          </Button>
        </Link>
      ) : (
        <>
          <Button
            startIcon={<Person />}
            onClick={handleOpen}
          >
            {profile.title}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={isProfileOpen}
            onClose={handleClose}
            anchorOrigin={{
              vertical: 'bottom',
              horizontal: 'right',
            }}
            transformOrigin={{
              vertical: 'top',
              horizontal: 'right',
            }}
          >
            {profile.children.map(({ children: categoryChildren }, i) =>
              [
                categoryChildren.map(({ title, icon, url, onClick }, j) => (
                  <MenuItem key={j} onClick={() => {
                    onClick && onClick();
                    url && router.push(url);
                    handleClose();
                  }}>
                    <ListItemIcon>
                      {icon}
                    </ListItemIcon>
                    <ListItemText>
                      {title}
                    </ListItemText>
                  </MenuItem>
                )),
                i < profile.children.length - 1 && (
                  <Divider />
                )
              ]
            )}
          </Menu>
        </>
      )}
    </Grid>
  );
}

interface HeaderProps {
  logo: React.ReactElement;
  title: string;
  url: string;
  sections: Section[];
  profile?: ProfileMenu | null;
  signInUrl: string;
}

function Header({ logo, title, url: titleUrl, sections, profile, signInUrl }: HeaderProps) {
  const isDesktop = useMedia('(min-width: 700px)', true);
  const [isMenuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (isDesktop) {
      setMenuOpen(false);
    }
  }, [setMenuOpen, isDesktop]);

  return (
    <React.Fragment>
      <Toolbar sx={{ px: '0 !important', mb: 2, borderBottom: 1, borderColor: 'divider', flexDirection: isDesktop ? 'row' : 'column' }}>
        {isDesktop ? (
          <>
            <MenuTitle logo={logo} title={title} titleUrl={titleUrl} />
            <MenuSections sections={sections} />
            <ProfileMenuButton profile={profile} signInUrl={signInUrl} />
          </>
        ) : (
          <>
            <Stack direction="row" alignItems="center" gap={1} sx={{ mt: 0.9 }}>
              {!isDesktop && (
                <IconButton onClick={() => setMenuOpen(!isMenuOpen)}><MenuIcon /></IconButton>
              )}
              <MenuTitle logo={logo} title={title} titleUrl={titleUrl} />
            </Stack>
            <Collapse in={isMenuOpen}>
              <Stack direction="column" alignItems="center">
                <MenuSections sections={sections} />
                <ProfileMenuButton profile={profile} signInUrl={signInUrl} />
                <Box sx={{ height: 8 }} />
              </Stack>
            </Collapse>
          </>
        )}
      </Toolbar>
    </React.Fragment>
  );
}

interface LinkIcon {
  url: string;
  icon: React.ReactElement;
}

interface FooterProps {
  sections: Section[];
  title: string;
  subtitle: string[];
  links: LinkIcon[];
}

function Footer({ sections, title, subtitle, links }: FooterProps) {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.200', py: 6, mt: 'auto' }}>
      <Container maxWidth="lg">
        <Grid container>
          <Grid item container xs={12} md={6} sx={{ textAlign: 'center' }}>
            {sections.map(({ title, url }, i) => (
              <Grid key={i} item xs={12}>
                <Link href={url} passHref>
                  <MuiLink
                    color="inherit"
                    noWrap
                  >
                    {title}
                  </MuiLink>
                </Link>
              </Grid>
            ))}
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <strong>{title}</strong>
            <br /><br />
            {subtitle.map((sub, i) => (
              <Fragment key={i}>
                {sub}
                {i < subtitle.length - 1 && (
                  <br />
                )}
              </Fragment>
            ))}
            <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
              {links.map(({ url, icon }, i) => (
                <MuiLink key={i} href={url}>
                  {icon}
                </MuiLink>
              ))}
            </Stack>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

interface FrontsiteContainerLayoutProps {
  logo: React.ReactElement;
  title: string;
  url: string;
  sections: Section[];
  profile?: ProfileMenu | null;
  signInUrl: string;
  footerSections: Section[];
  footerSubtitle: string[];
  footerLinks: LinkIcon[];
  children: React.ReactNode;
}

export const FrontsiteContainerLayout: React.FC<FrontsiteContainerLayoutProps> = ({
  logo,
  title,
  url,
  sections,
  profile,
  signInUrl,
  footerSections,
  footerSubtitle,
  footerLinks,
  children
}) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header logo={logo} title={title} url={url} sections={sections} profile={profile} signInUrl={signInUrl} />
        <Box component="main" sx={{ mb: 2 }}>
          {children}
        </Box>
      </Container>
      <Footer sections={footerSections} title={title} subtitle={footerSubtitle} links={footerLinks} />
    </Box>
  );
};
