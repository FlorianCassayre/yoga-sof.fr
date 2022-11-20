import React from 'react';
import { Grid } from '@mui/material';

interface YogaImageProps {
  src: string;
  alt: string;
}

export const YogaImage: React.FC<YogaImageProps> = ({ src, alt }) => {
  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={10} md={8} lg={6}>
        <img src={src} alt={alt} style={{ width: '100%', borderRadius: '4px' }} />
      </Grid>
    </Grid>
  );
};
