import { format, isValid, parse } from 'date-fns';
import { Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Field } from 'react-final-form';

export function TimePickerField({ name, label, fieldProps = {}, ...props }) {
  const getEpoch = () => new Date(0);

  const timeFormatDb = 'HH:mm';
  const timeFormatDisplay = `HH'h'mm`;

  return (
    <Form.Group {...props}>
      <Form.Label>{label}</Form.Label>
      <Field
        name={name}
        render={({ input: { value, onChange } }) => {
          const parsed = parse(value, timeFormatDb, getEpoch());
          return (
            <DatePicker
              /*locale="fr"*/
              required
              selected={value && isValid(parsed) ? parsed : null}
              onChange={(date) => onChange(isValid(date) ? format(new Date(date), timeFormatDb) : null)}
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Heure"
              dateFormat={timeFormatDisplay}
              timeFormat={timeFormatDisplay}
              customInput={<Form.Control />}
              {...fieldProps}
            />
          );
        }}
      />
    </Form.Group>
  );
}
