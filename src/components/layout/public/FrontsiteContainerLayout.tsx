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
  useMediaQuery, useTheme,
} from '@mui/material';
import { Menu as MenuIcon, Person } from '@mui/icons-material';
import CssBaseline from '@mui/material/CssBaseline';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { OptionalLink } from '../../OptionalLink';

interface MenuTitleProps {
  logo: React.ReactElement;
  title: string;
  titleUrl: string;
  onClick?: () => void;
}

const MenuTitle: React.FC<MenuTitleProps> = ({ logo, title, titleUrl, onClick }) => {
  return (
    <Link href={titleUrl} passHref legacyBehavior>
      <MuiLink
        variant="h5"
        color="inherit"
        noWrap
        onClick={() => onClick && onClick()}
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
  onClick?: () => void;
}

const MenuSections: React.FC<MenuSectionsProps> = ({ sections, onClick }) => {
  const router = useRouter();
  return (
    <>
      {sections.map(({ title, url }, i) => (
        <Link
          key={i}
          href={url}
          passHref legacyBehavior
        >
          <MuiLink
            color="inherit"
            noWrap
            variant="body2"
            onClick={() => onClick && onClick()}
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
        <Link href={signInUrl} passHref legacyBehavior>
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
                  <OptionalLink key={j} href={url} passHref legacyBehavior>
                    <MenuItem onClick={() => {
                      onClick && onClick();
                      handleClose();
                    }} component={(url ? 'a' : undefined) as any}>
                      <ListItemIcon>
                        {icon}
                      </ListItemIcon>
                      <ListItemText>
                        {title}
                      </ListItemText>
                    </MenuItem>
                  </OptionalLink>
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

function Header({logo, title, url: titleUrl, sections, profile, signInUrl}: HeaderProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [isMenuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (isDesktop) {
      setMenuOpen(false);
    }
  }, [setMenuOpen, isDesktop]);

  const toolbarSx = {
    px: '0 !important',
    mb: 2,
    borderBottom: 1,
    borderColor: 'divider',
    flexDirection: { xs: 'column', md: 'row' }
  };

  return (
    <>
      <Toolbar sx={{ ...toolbarSx, display: { xs: 'none', md: 'flex' } }}>
        <MenuTitle logo={logo} title={title} titleUrl={titleUrl}/>
        <MenuSections sections={sections}/>
        <ProfileMenuButton profile={profile} signInUrl={signInUrl}/>
      </Toolbar>
      <Toolbar sx={{ ...toolbarSx, display: { xs: 'flex', md: 'none' } }}>
        <IconButton onClick={() => setMenuOpen(!isMenuOpen)} sx={{ position: 'absolute', left: 0, top: { xs: 8, sm: 12 } }}><MenuIcon/></IconButton>
        <Box alignItems="center" sx={{ mt: { xs: 1.4, sm: 2 }, mb: -10 }}>
          <MenuTitle logo={logo} title={title} titleUrl={titleUrl} onClick={() => setMenuOpen(false)}/>
        </Box>
        <Collapse in={isMenuOpen}>
          <Box sx={{ mt: 7 }} />
          <Stack direction="column" alignItems="center">
            <MenuSections sections={sections} onClick={() => setMenuOpen(false)}/>
            <ProfileMenuButton profile={profile} signInUrl={signInUrl}/>
            <Box sx={{ height: 8 }}/>
          </Stack>
        </Collapse>
      </Toolbar>
    </>
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
        <Grid container spacing={4}>
          <Grid item container xs={12} md={6} sx={{ textAlign: 'center' }}>
            {sections.map(({ title, url }, i) => (
              <Grid key={i} item xs={12}>
                <Link href={url} passHref legacyBehavior>
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
                <MuiLink key={i} href={url} target="_blank" rel="noopener noreferrer">
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
