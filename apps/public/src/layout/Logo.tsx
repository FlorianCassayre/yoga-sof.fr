import { Box } from '@mui/material';

export const Logo = () => {
  return (
    <Box
      sx={{
        width: 42,
        height: 42,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        padding: 0.5,
      }}
    >
      <img src="/icon.svg" alt="Logo" width="100%" height="100%" />
    </Box>
  );
};
