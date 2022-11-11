import React, { Fragment } from 'react';
import {
  Alert,
  Box,
  Button, Card,
  CardActionArea, CardContent, CardMedia, Chip,
  Container,
  Divider,
  Grid,
  Link as MuiLink, ListItemIcon, ListItemText, Menu, MenuItem,
  Paper, Skeleton,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import { Accessibility, AccessTime, DarkMode, FormatQuote, GitHub, Group, Groups, Person } from '@mui/icons-material';
import CssBaseline from '@mui/material/CssBaseline';
import Link from 'next/link';
import { useRouter } from 'next/router';

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

interface HeaderProps {
  title: string;
  sections: Section[];
  profile?: ProfileMenu | null;
}

function Header({ title, sections, profile }: HeaderProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = !!anchorEl;
  const handleOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const router = useRouter();

  return (
    <React.Fragment>
      <Toolbar sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}>
        <Typography
          component="h1"
          variant="h5"
          color="inherit"
          noWrap
          sx={{ pr: 2, flexShrink: 0 }}
        >
          {title}
        </Typography>
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
              sx={{ p: 1, flexShrink: 0 }}
            >
              {title}
            </MuiLink>
          </Link>
        ))}
        <Grid container justifyContent="flex-end">
          {profile === undefined ? (
            <Skeleton variant="text" width={150} />
          ) : profile === null ? (
            <Button variant="outlined" size="small" >
              Connexion
            </Button>
          ) : (
            <>
              <Button
                startIcon={<Person />}
                onClick={handleOpen}
              >
                {profile.title}
              </Button>
              <Menu
                id="basic-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'basic-button',
                }}
              >
                {profile.children.map(({ children: categoryChildren }, i) => (
                  <Fragment key={i}>
                    {categoryChildren.map(({ title, icon, url, onClick }, j) => (
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
                    ))}
                    {i < profile.children.length - 1 && (
                      <Divider />
                    )}
                  </Fragment>
                ))}
              </Menu>
            </>
          )}
        </Grid>
      </Toolbar>
    </React.Fragment>
  );
}

interface FooterProps {
  sections: Section[];
  title: string;
  subtitle: string[];
}

function Footer({ sections, title, subtitle }: FooterProps) {
  return (
    <Box component="footer" sx={{ bgcolor: 'grey.200', py: 6 }}>
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
              <>
                {sub}
                {i < subtitle.length - 1 && (
                  <br />
                )}
              </>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

interface Section {
  title: string;
  url: string;
}

interface FrontsiteContainerLayoutProps {
  title: string;
  sections: Section[];
  profile?: ProfileMenu | null;
  footerSections: Section[];
  footerSubtitle: string[];
  children: React.ReactNode;
}

export const FrontsiteContainerLayout: React.FC<FrontsiteContainerLayoutProps> = ({
  title,
  sections,
  profile,
  footerSections,
  footerSubtitle,
  children
}) => {
  return (
    <>
      <CssBaseline />
      <Container maxWidth="lg">
        <Header title={title} sections={sections} profile={profile} />
        <main>
          {children}
        </main>
      </Container>
      <Footer sections={footerSections} title={title} subtitle={footerSubtitle} />
    </>
  );
};
