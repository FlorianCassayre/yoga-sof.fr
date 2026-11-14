import { Box, IconButton, Tooltip } from '@mui/material';
import { Check, X } from 'lucide-react';

interface PresenceIconProps {
  value: boolean | null;
  colored?: boolean;
  disabled?: boolean;
  onClick?: () => void;
}

export const PresenceIcon = ({
  value,
  colored = true,
  disabled = false,
  onClick,
}: PresenceIconProps) => {
  const label = value === true ? 'Présent(e)' : value === false ? 'Absent(e)' : 'Non rempli';

  return (
    <Tooltip title={label}>
      <span>
        <IconButton
          size="small"
          disabled={disabled}
          sx={disabled ? { opacity: 0.5 } : undefined}
          onClick={onClick}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 20,
              height: 20,
              borderRadius: '50%',
              bgcolor:
                colored === false
                  ? 'grey.400'
                  : value === true
                    ? 'success.main'
                    : value === false
                      ? 'error.main'
                      : 'warning.main',
              color: 'common.white',
            }}
          >
            {value === true ? (
              <Check size={13} />
            ) : value === false ? (
              <X size={13} />
            ) : (
              <Box component="span" sx={{ fontSize: 12, fontWeight: 'bold', lineHeight: 1 }}>
                ?
              </Box>
            )}
          </Box>
        </IconButton>
      </span>
    </Tooltip>
  );
};
