import React, { Fragment } from 'react';
import {
  Alert,
  Box,
  Button, Card,
  CardActionArea, CardContent, CardMedia, Chip,
  Container,
  Divider,
  Grid,
  Link as MuiLink,
  Paper,
  Stack,
  Toolbar,
  Typography
} from '@mui/material';
import { Accessibility, AccessTime, DarkMode, FormatQuote, GitHub, Group, Groups } from '@mui/icons-material';
import CssBaseline from '@mui/material/CssBaseline';
import Link from 'next/link';

interface ProfileMenuItem {
  title: string;
  icon: JSX.Element;
  url: string;
}

interface ProfileMenuCategory {
  children: ProfileMenuItem[];
}

interface ProfileMenu {
  name: string;
  children: ProfileMenuCategory[];
}

interface HeaderProps {
  title: string;
  sections: Section[];
  profile?: ProfileMenu;
}

function Header({ title, sections, profile }: HeaderProps) {
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
          {!profile ? (
            <Button variant="outlined" size="small" >
              Connexion
            </Button>
          ) : null}
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
  profile?: ProfileMenu;
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
