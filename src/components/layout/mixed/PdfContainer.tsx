import React, { useMemo, useRef } from 'react';
import { Box, CssBaseline, LinearProgress } from '@mui/material';

interface PdfEmbedProps {
  src: string;
}

const PdfEmbed: React.FC<PdfEmbedProps> = ({ src }) => {
  const staticSrc = useMemo(() => src, []);
  const ref = useRef<HTMLEmbedElement | null>(null);
  return (
    <embed ref={ref} src={staticSrc} type="application/pdf" width="100%" height="100%" />
  );
}

interface PdfContainerProps {
  pdf?: Buffer;
  isError?: boolean;
}

export const PdfContainer: React.FC<PdfContainerProps> = ({ pdf, isError }) => {
  const pdfUrl = useMemo(() => pdf ? URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' })) : null, [pdf]);
  return (
    <Box sx={{ width: 'auto', height: '100vh', overflow: 'hidden' }}>
      <CssBaseline />
      {pdfUrl !== null ? (
        <PdfEmbed src={pdfUrl} />
      ) : !isError ? (
        <LinearProgress sx={{ width: '100%' }} />
      ) : null}
    </Box>
  );
};
