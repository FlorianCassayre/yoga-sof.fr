import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

export function SlotsNumberField({ name, fieldProps = {}, ...props }) {
  return (
    <Form.Group {...props}>
      <Form.Label>Nombre de places :</Form.Label>
      <Field
        name={name}
        render={({ input }) => (
          <Form.Control
            {...input}
            type="number" min={1} max={99}
            required
            {...fieldProps}
          />
        )}
      />
    </Form.Group>
  );
}
