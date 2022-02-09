import { Form, InputGroup } from 'react-bootstrap';
import { Field } from 'react-final-form';

export function SimpleInputField({ name, label, type = null, required, fieldProps = {}, ...props }) {
  return (
    <Form.Group {...props}>
      <Form.Label>{label}</Form.Label>
      <InputGroup {...props}>
        <Field
          name={name}
          render={({ input }) => (
            <Form.Control type={type} required={required} {...input} {...fieldProps} />
          )}
        />
      </InputGroup>
    </Form.Group>
  );
}
