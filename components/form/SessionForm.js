import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Form as FinalForm, Field } from 'react-final-form';
import { SESSIONS_TYPES } from '../sessions';
import { format, formatDistance, formatRelative, subDays } from 'date-fns';

export function SessionForm({ initialSessionType }) {

  const getEpoch = () => new Date(0);

  const onSubmit = (a, b, c) => console.log(a, b, c);

  const [startDate, setStartDate] = useState(getEpoch());

  const DatePickerField = ({ name }) => (
    <Field
      name={name}
      render={({ name, input, input: { value, onChange } }) => (
        <DatePicker
          locale="fr"
          selected={value ? new Date(value) : null}
          onChange={(date) => {
            input.onChange(format(new Date(date), "dd-MM-yyyy"));
          }}
          showTimeSelect
          showTimeSelectOnly
          timeIntervals={5}
          timeCaption="Heure de début"
          dateFormat="HH:mm"
          timeFormat="HH:mm"
        />
      )}
    />
  );

  const renderForm = ({ handleSubmit }) => (
    <Form onSubmit={handleSubmit}>

      <Field
        name="sessionType"
        render={({ input }) => (
          <Form.Select {...input}>
            {SESSIONS_TYPES.map(({ id, title }) => (
              <option key={id} value={id}>{title}</option>
            ))}
          </Form.Select>
        )}
      />

      {/*<DatePickerField name="startTime" />
      <DatePickerField name="endTime" />*/}

      <Button type="submit" disabled={false} className="width-max">
        Créer
      </Button>
    </Form>
  );

  return (
    <FinalForm
      onSubmit={onSubmit}
      initialValues={{
        sessionType: initialSessionType ?? SESSIONS_TYPES[0].id,
        startTime: null,
      }}
      /*validate={validate}*/
      render={renderForm}
    />
  );
}
