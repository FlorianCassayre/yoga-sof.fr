import { format, isValid, parse } from 'date-fns';
import { Col, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Field } from 'react-final-form';

export function TimePickerField({ name, label, fieldProps = {}, ...props }) {

  const getEpoch = () => new Date(0);

  const timeFormat = 'HH:mm';

  return (
    <Form.Group {...props}>
      <Form.Label>{label}</Form.Label>
      <Field
        name={name}
        render={({ input, input: { value, onChange } }) => {
          const parsed = parse(value, timeFormat, getEpoch());
          return (
            <DatePicker
              /*locale="fr"*/
              required
              selected={value && isValid(parsed) ? parsed : null}
              onChange={date => input.onChange(isValid(date) ? format(new Date(date), timeFormat) : null)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Heure"
              dateFormat="HH'h'mm"
              timeFormat="HH'h'mm"
              customInput={<Form.Control />}
              {...fieldProps}
            />
          );
        }}
      />
    </Form.Group>
  );
}