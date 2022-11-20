import React from 'react';
import { Box, Typography } from '@mui/material';

interface YogaQuoteProps {
  author: string;
  quote: string;
  source: string;
}

export const YogaQuote: React.FC<YogaQuoteProps> = ({ author, quote, source }) => {
  return (
    <Box textAlign="center" sx={{ mb: 2 }}>
      <Typography variant="h6" component="div">{author}</Typography>
      <Typography>"{quote}"</Typography>
      <Typography variant="caption" color="text.secondary">{source}</Typography>
    </Box>
  );
};
