import { FloatingLabel, Form, InputGroup } from 'react-bootstrap';
import { Field } from 'react-final-form';

export function FloatingInputField({ name, label, placeholder, type = null, required, parse, fieldProps = {}, ...props }) {
  return (
    <Form.Group {...props}>
      <FloatingLabel controlId={`floating-${name}`} label={label}>
        <Field
          name={name}
          parse={parse}
          render={({ input, meta }) => (
            <Form.Control type={type} placeholder={placeholder} required={required} isInvalid={(meta.error || meta.submitError) && meta.touched} {...input} {...fieldProps} />
          )}
        />
      </FloatingLabel>
    </Form.Group>
  );
}
