import { Col, Row } from 'react-bootstrap';
import { TimePickerField } from './TimePickerField';

export function TimePickerRangeFields({ disabled, ...props }) {
  return (
    <Row {...props}>
      <TimePickerField name="timeStart" label="Heure de début :" as={Col} fieldProps={{ disabled }} />
      <TimePickerField name="timeEnd" label="Heure de fin :" as={Col} fieldProps={{ disabled }} />
    </Row>
  );
}
