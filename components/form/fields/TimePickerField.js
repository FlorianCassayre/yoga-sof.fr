import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { minutesToParsedTime, parsedTimeToTime } from '../../../lib/common';

export function TimePickerField({ name, label, interval = 15, fieldProps = {}, ...props }) {
  const maxTimeMinutes = 24 * 60;
  const options = [];
  for (let minutes = 0; minutes < maxTimeMinutes; minutes += interval) {
    const time = parsedTimeToTime(minutesToParsedTime(minutes));
    options.push({ value: time, display: time.replace(':', 'h') });
  }

  return (
    <Form.Group {...props}>
      <Form.Label>{label}</Form.Label>
      <Field
        name={name}
        render={({ input }) => (
          <Form.Select {...input} required {...fieldProps}>
            <option value={null} disabled />
            {options.map(({ value, display }) => (
              <option key={value} value={value}>
                {display}
              </option>
            ))}
          </Form.Select>
        )}
      />
    </Form.Group>
  );
}
