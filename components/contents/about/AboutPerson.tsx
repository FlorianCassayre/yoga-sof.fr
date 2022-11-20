import React from 'react';
import { Box, Grid, Typography, Link as MuiLink, Stack } from '@mui/material';
import { grey } from '@mui/material/colors';
import { useMedia } from 'react-use';

interface AboutPersonProps {
  personImageSrc: string;
  personName: string;
  personTitle: string;
  links: { label: string, url: string, icon: React.ReactElement }[];
  certifications: { icon: React.ReactElement, alt: string, href: string }[];
  children: React.ReactNode;
}

export const AboutPerson: React.FC<AboutPersonProps> = ({ personImageSrc, personName, personTitle, links, certifications, children }) => {
  const isWide = useMedia('(min-width: 700px)', true);
  return (
    <Grid container spacing={4} sx={{ my: 0 }}>
      <Grid item xs={12} md={4} lg={3}>
        <Box sx={{ px: { xs: 8, sm: 24, md: 0 } }}>
          <img src={personImageSrc} alt={personName} style={{ width: '100%', borderRadius: '50%' }} />
        </Box>
        <Box textAlign="center" sx={{ mt: 1 }}>
          <Typography fontWeight="bold">{personName}</Typography>
          <Typography color="text.secondary">{personTitle}</Typography>
        </Box>
        <Box sx={{ mt: 2 }}>
          {links.map(({ label, url, icon }) => (
            <MuiLink key={url} href={url} target="_blank" rel="noreferrer nofollow">
              <Stack direction="row" spacing={1} justifyContent="center">
                {icon}
                <span>
                  {label}
                </span>
              </Stack>
            </MuiLink>
          ))}
        </Box>
      </Grid>
      <Grid item xs={12} md={8} lg={9}>
        {children}
        <Box textAlign="center">
          <Stack direction={isWide ? 'row' : 'column'} spacing={4} justifyContent="center" sx={{ mt: 4 }}>
            {certifications.map(({ icon, alt, href }) => (
              <Box key={href}>
                {icon}
              </Box>
            ))}
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );
};
