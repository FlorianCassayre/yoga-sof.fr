import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';

interface HomepageCardProps {
  title: string;
  icon: React.ReactElement;
  description: string;
}

const HomepageCard: React.FC<HomepageCardProps> = ({ title, icon, description }) => {
  return (
    <Grid item xs={12} md={4} display="flex" alignItems="stretch">
      <Paper sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="h5" component="div">
          {title}
        </Typography>
        <Typography variant="h5" component="div" sx={{ mt: 1 }}>
          {icon}
        </Typography>
        <Typography variant="body1" component="div">
          {description}
        </Typography>
      </Paper>
    </Grid>
  );
};

interface HomepageCardsProps {
  children: React.ReactNode;
}

const HomepageCards: React.FC<HomepageCardsProps> & { Card: typeof HomepageCard } = ({ children }) => {
  return (
    <Grid container spacing={5} sx={{ mb: 2 }}>
      {children}
    </Grid>
  );
};

HomepageCards.Card = HomepageCard;

export { HomepageCards };
