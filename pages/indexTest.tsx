import React, { Fragment } from 'react';
import {
  GitHub,
  Twitter,
  Facebook,
  Search,
  AccessTime,
  Accessibility,
  DarkMode,
  Groups,
  FormatQuote, Group
} from '@mui/icons-material';
import {
  Container,
  Grid,
  Typography,
  CardActionArea,
  Card,
  CardContent,
  CardMedia,
  Box,
  Toolbar,
  Button,
  IconButton,
  Link, Divider, Paper, Stack, CssBaseline, Chip, Alert, styled, Badge
} from '@mui/material';

interface SidebarProps {
  archives: ReadonlyArray<{
    url: string;
    title: string;
  }>;
  description: string;
  social: ReadonlyArray<{
    icon: React.ElementType;
    name: string;
  }>;
  title: string;
}

function Sidebar(props: SidebarProps) {
  const { archives, description, social, title } = props;

  return (
    <Grid item xs={12} md={4}>
      <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.200' }}>
        <Typography variant="h6" gutterBottom>
          {title}
        </Typography>
        <Typography>{description}</Typography>
      </Paper>
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Archives
      </Typography>
      {archives.map((archive) => (
        <Link display="block" variant="body1" href={archive.url} key={archive.title}>
          {archive.title}
        </Link>
      ))}
      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Social
      </Typography>
      {social.map((network) => (
        <Link
          display="block"
          variant="body1"
          href="#"
          key={network.name}
          sx={{ mb: 0.5 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <network.icon />
            <span>{network.name}</span>
          </Stack>
        </Link>
      ))}
    </Grid>
  );
}

interface MainFeaturedPostProps {

}

function MainFeaturedPost(props: MainFeaturedPostProps) {
  const imageUrl = '/images/maison-japon.jpg';
  return (
    <Paper
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: '#fff',
        mb: 4,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url(${imageUrl})`,
      }}
    >
      {/* Increase the priority of the background image */}
      {<img style={{ display: 'none' }} src={imageUrl} alt="Illustration Yoga Sof" />}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          right: 0,
          left: 0,
          backgroundColor: 'rgba(0,0,0,.3)',
        }}
      />
      <Grid container>
        <Grid item xs={12}>
          <Box
            sx={{
              position: 'relative',
              p: { xs: 3, md: 6 },
            }}
            style={{ textShadow: 'black 2px 2px 4px', textAlign: 'center' }}
          >
            <Typography component="h1" variant="h3" color="inherit" gutterBottom>
              Yoga Sof
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              Pratique du Yoga à Hésingue
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
}

interface MainProps {
  posts: ReadonlyArray<string>;
  title: string;
}

function Main(props: MainProps) {
  const { posts, title } = props;

  return (
    <Grid
      item
      xs={12}
      md={8}
      sx={{
        '& .markdown': {
          py: 3,
        },
      }}
    >
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      <Divider />
      {posts.map((post, i) => (
        <Fragment key={i}>
          {post}
        </Fragment>
      ))}
    </Grid>
  );
}

interface HeaderProps {
  sections: ReadonlyArray<{
    title: string;
    url: string;
  }>;
  title: string;
}

function Header(props: HeaderProps) {
  const { sections, title } = props;

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
        {sections.map((section) => (
          <Link
            color="inherit"
            noWrap
            key={section.title}
            variant="body2"
            href={section.url}
            sx={{ p: 1, flexShrink: 0 }}
          >
            {section.title}
          </Link>
        ))}
        <Grid container justifyContent="flex-end">
          <Button variant="outlined" size="small" >
            Connexion
          </Button>
        </Grid>
      </Toolbar>
    </React.Fragment>
  );
}

function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

interface FooterProps {
  description: string;
  title: string;
}

function Footer(props: FooterProps) {
  const { description, title } = props;

  return (
    <Box component="footer" sx={{ bgcolor: 'grey.200', py: 6 }}>
      <Container maxWidth="lg">
        <Grid container sx={{ /*color: 'text.secondary'*/ }}>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            Accueil<br/>
            Le Yoga<br/>
            Les séances<br/>
            Inscription<br/>
            À propos<br/>
            Règlement intérieur<br/>
            Politique de confidentialité<br/>
          </Grid>
          <Grid item xs={12} md={6} sx={{ textAlign: 'center' }}>
            <strong>Yoga Sof</strong>
            <br /><br />
            Sophie Richaud-Cassayre
            <br />
            Enseignante de Yoga
            {[0, 1, 2].map((i) => (
              <Link
                display="block"
                variant="body1"
                href="#"
                key={i}
                sx={{ mb: 0.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <GitHub />
                  <span>GitHub</span>
                </Stack>
              </Link>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

interface FeaturedPostProps {

}

function FeaturedPost(props: FeaturedPostProps) {
  return (
    <Grid item xs={12}>
      <CardActionArea component="a" href="#">
        <Card elevation={4} sx={{ display: { xs: 'inherit', md: 'flex' } }}>
          <CardContent sx={{ flex: 1 }}>
            <Typography component="h2" variant="h5" sx={{ mb: 1 }}>
              Séances de Yoga adulte
            </Typography>
            <Typography paragraph>
              J'enseigne un hatha Yoga respectueux de la physiologie de votre corps, en petit groupe convivial de 4 personnes, à Hésingue. Dès que nécessaire durant la séance, je vous proposerai des adaptations individuelles des postures à l'aide d'accessoires ou de variantes pour vous aider à développer votre force et votre souplesse sans inconfort, ni risque de blessure car selon moi, les postures doivent s'adapter à la personne, à sa morphologie et non l'inverse.
              Mes séances sont progressives et incluent tous les outils du Yoga ; postures, pranayamas, relaxations ainsi qu'un travail mental pour vous amener à vous détendre et ressentir les bienfaits de votre pratique, ainsi progresser sur le chemin de la connaissance de votre moi.
            </Typography>
            <Grid container justifyContent="center">
              <Chip icon={<Accessibility />} label="Adultes" variant="outlined" sx={{ m: 0.5 }} />
              <Chip icon={<DarkMode />} label="Tous niveaux" variant="outlined" sx={{ m: 0.5 }} />
              <Chip icon={<Groups />} label="4 à 5 personnes" variant="outlined" sx={{ m: 0.5 }} />
              <Chip icon={<AccessTime />} label="Séance de 1h15" variant="outlined" sx={{ m: 0.5 }} />
            </Grid>
          </CardContent>
          <CardMedia
            component="img"
            sx={{ width: { md: 300 }, height: { xs: 300, md: 'inherit' } }}
            image="/images/arbre-ocean.jpg"
            alt="Image d'illustration"
          />
        </Card>
      </CardActionArea>
    </Grid>
  );
}

const sections = [
  { title: 'Accueil', url: '#' },
  { title: 'Le Yoga', url: '#' },
  { title: 'Les séances', url: '#' },
  { title: 'Inscription', url: '#' },
  { title: 'À propos', url: '#' },
];

const mainFeaturedPost = {
  title: 'Title of a longer featured blog post',
  description:
    "Multiple lines of text that form the lede, informing new readers quickly and efficiently about what's most interesting in this post's contents.",
  image: 'https://source.unsplash.com/random',
  imageText: 'main image description',
  linkText: 'Continue reading…',
};

const featuredPosts = [
  {

  },
  {

  },
  {

  },
];

const posts = ['post1', 'post2', 'post3'];

const sidebar = {
  title: 'About',
  description:
    'Etiam porta sem malesuada magna mollis euismod. Cras mattis consectetur purus sit amet fermentum. Aenean lacinia bibendum nulla sed consectetur.',
  archives: [
    { title: 'March 2020', url: '#' },
    { title: 'February 2020', url: '#' },
    { title: 'January 2020', url: '#' },
    { title: 'November 1999', url: '#' },
    { title: 'October 1999', url: '#' },
    { title: 'September 1999', url: '#' },
    { title: 'August 1999', url: '#' },
    { title: 'July 1999', url: '#' },
    { title: 'June 1999', url: '#' },
    { title: 'May 1999', url: '#' },
    { title: 'April 1999', url: '#' },
  ],
  social: [
    { name: 'GitHub', icon: GitHub },
    { name: 'Twitter', icon: Twitter },
    { name: 'Facebook', icon: Facebook },
  ],
};

const PageNew: React.FC = () => {
  return (
    <>
      <MainFeaturedPost />
      <Grid container spacing={4}>
        {featuredPosts.map((post, i) => (
          <FeaturedPost key={i} />
        ))}
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Grid container justifyContent="center">
        <Grid item xs={11} lg={8}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.200' }}>
            <Typography variant="h6" gutterBottom>
              <FormatQuote sx={{ transform: 'rotate(180deg)' }} />
              C'est à travers l'alignement de mon corps que j'ai découvert l'alignement de mon esprit, de mon Être et de mon intelligence.
              <FormatQuote />
            </Typography>
            <Typography>
              Sri B.K.S Iyengar
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      <Divider sx={{ my: 3 }} />
      <Grid container spacing={5} sx={{ mb: 2 }}>
        {[0, 1, 2].map(() => (
          <Grid item xs={12} md={4} alignItems="stretch">
            <Paper sx={{ p: 2, textAlign: 'center' }}>
              <Typography variant="h5" component="div">
                Effectifs réduits
              </Typography>
              <Typography variant="h5" component="div" sx={{ mt: 1 }}>
                <Group />
              </Typography>
              <Typography variant="body1" component="div">
                Les séances se déroulent en petit nombre.
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
      <Alert severity="info" sx={{ mb: 3 }}>La première séance vous est offerte. <a href="/inscription">Je m'inscris maintenant</a></Alert>
    </>
  );
}

export default PageNew;
