import React from 'react';
import { Grid, Paper, Typography } from '@mui/material';
import { FormatQuote } from '@mui/icons-material';

interface HomepageQuoteProps {
  quote: string;
  author: string;
}

export const HomepageQuote: React.FC<HomepageQuoteProps> = ({ quote, author }) => {
  return (
    <Grid container justifyContent="center" sx={{ mt: 2, mb: 4 }}>
      <Grid item xs={11} lg={8}>
        <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.200' }}>
          <Typography variant="h6" gutterBottom>
            <FormatQuote sx={{ transform: 'rotate(180deg)' }} />
            {quote}
            <FormatQuote />
          </Typography>
          <Typography>
            {author}
          </Typography>
        </Paper>
      </Grid>
    </Grid>
  );
};
