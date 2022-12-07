import React from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';

interface HomepageBannerProps {
  title: string;
  subtitle: string;
  imageUrl: string;
}

export const HomepageBanner: React.FC<HomepageBannerProps> = ({ title, subtitle, imageUrl }) => {
  return (
    <Paper
      sx={{
        position: 'relative',
        backgroundColor: 'grey.800',
        color: '#fff',
        mb: 2,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundImage: `url(${imageUrl})`,
      }}
    >
      {/* Increase the priority of the background image */}
      {<img style={{ display: 'none' }} src={imageUrl} alt={title} />}
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
              {title}
            </Typography>
            <Typography variant="h5" color="inherit" paragraph>
              {subtitle}
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Paper>
  );
};
