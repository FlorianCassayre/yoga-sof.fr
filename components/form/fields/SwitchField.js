import { Form, FormControl, InputGroup } from 'react-bootstrap';
import { Field } from 'react-final-form';

export function SwitchField({ name, label, fieldProps = {}, ...props }) {
  return (
    <Form.Group {...props}>
      <Field
        type="checkbox"
        name={name}
        render={({ input: { type, ...input } }) => (
          <Form.Check
            type="switch"
            id={name}
            label={label}
            {...input}
            {...fieldProps}
          />
        )}
      />
    </Form.Group>
  );
}
