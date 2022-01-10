import { Col, Form, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Field } from 'react-final-form';
import { WEEKDAYS } from '../date';
import { SESSIONS_TYPES } from '../sessions';
import { format, isValid, parse } from 'date-fns';
import { CreateEditForm } from './CreateEditForm';

export function SessionForm({ editRecordId }) {

  const getEpoch = () => new Date(0);

  const timeFormat = 'HH:mm';

  const DatePickerField = ({ name }) => (
    <Field
      name={name}
      render={({ name, input, input: { value, onChange } }) => {
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
            timeCaption="Heure de début"
            dateFormat="HH'h'mm"
            timeFormat="HH'h'mm"
            customInput={<Form.Control />}
          />
        );
      }}
    />
  );

  return (
    <>
      <CreateEditForm
        modelId="session_models"
        initialValues={{
          id: SESSIONS_TYPES[0].id,
          weekday: 0,
          time_start: null,
          time_end: null,
          spots: 1,
        }}
        numberFields={['weekday', 'spots']}
        redirect={() => `/administration/seances`}
        editRecordId={editRecordId}
      >
        <Form.Group className="mb-2">
          <Form.Label>Type de séance :</Form.Label>
          <Field
            name="id"
            render={({ input }) => (
              <Form.Select {...input} disabled={editRecordId != null}>
                {SESSIONS_TYPES.map(({ id, title }) => (
                  <option key={id} value={id}>{title}</option>
                ))}
              </Form.Select>

            )}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Jour de la semaine :</Form.Label>
          <Field
            name="weekday"
            render={({ input }) => (
              <Form.Select {...input}>
                {WEEKDAYS.map((weekday, id) => (
                  <option key={id} value={id}>{weekday}</option>
                ))}
              </Form.Select>
            )}
          />
        </Form.Group>

        <Form.Group className="mb-2">
          <Form.Label>Nombre de places :</Form.Label>
          <Field
            name="spots"
            render={({ input }) => (
              <Form.Control
                {...input}
                type="number" min={1} max={99}
              />
            )}
          />
        </Form.Group>

        <Row className="mb-2">
          <Form.Group as={Col}>
            <Form.Label>Heure de début</Form.Label>
            <DatePickerField name="time_start" />
          </Form.Group>

          <Form.Group as={Col}>
            <Form.Label>Heure de fin</Form.Label>
            <DatePickerField name="time_end" />
          </Form.Group>
        </Row>

      </CreateEditForm>
    </>
  );
}
