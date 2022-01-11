import { Col, Row } from 'react-bootstrap';
import { TimePickerField } from './TimePickerField';

export function TimePickerRangeFields({ disabled, ...props }) {
  return (
    <Row {...props}>
      <TimePickerField name="time_start" label="Heure de début :" as={Col} fieldProps={{ disabled: disabled }} />
      <TimePickerField name="time_end" label="Heure de fin :" as={Col} fieldProps={{ disabled: disabled }} />
    </Row>
  );
}