import { PresenceIcon } from './PresenceIcon';

interface PresenceButtonsProps {
  value: boolean | null;
  pendingValue?: boolean | null;
  onChange: (value: boolean | null) => void;
}

const OPTIONS: { value: boolean | null }[] = [{ value: true }, { value: null }, { value: false }];

export const PresenceButtons = ({ value, pendingValue, onChange }: PresenceButtonsProps) => (
  <>
    {OPTIONS.map(({ value: optionValue }) => {
      const disabled = pendingValue !== undefined && optionValue !== pendingValue;

      return (
        <PresenceIcon
          key={String(optionValue)}
          value={optionValue}
          colored={optionValue === value}
          disabled={disabled}
          onClick={() => onChange(optionValue)}
        />
      );
    })}
  </>
);
