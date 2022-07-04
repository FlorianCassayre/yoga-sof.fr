import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';

export function SwitchField({ name, label, mainLabel, muted, fieldProps = {}, ...props }) {
  return (
    <Form.Group {...props}>
      {mainLabel && (
        <Form.Label>{mainLabel}</Form.Label>
      )}
      <Field type="checkbox" name={name} render={({ input: { type, ...input } }) => <Form.Check type="switch" id={name} label={label} {...input} {...fieldProps} />} />
      {muted && (
        <Form.Text className="text-muted">
          {muted}
        </Form.Text>
      )}
    </Form.Group>
  );
}
