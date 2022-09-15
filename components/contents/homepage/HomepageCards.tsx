import React from 'react';
import { Card, CardContent, Grid, Paper, Typography } from '@mui/material';

interface HomepageCardProps {
  title: string;
  icon: React.ReactElement;
  description: string;
}

const HomepageCard: React.FC<HomepageCardProps> = ({ title, icon, description }) => {
  return (
    <Grid item xs={12} md={4} display="flex" alignItems="stretch">
      <Card variant="outlined" sx={{ textAlign: 'center' }}>
        <CardContent>
          <Typography variant="h5" component="div">
            {title}
          </Typography>
          <Typography variant="h5" component="div" sx={{ mt: 1 }}>
            {icon}
          </Typography>
          <Typography variant="body1" component="div">
            {description}
          </Typography>
        </CardContent>
      </Card>
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
