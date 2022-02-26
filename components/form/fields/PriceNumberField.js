import { Form, FormControl, InputGroup } from 'react-bootstrap';
import { Field } from 'react-final-form';

export function PriceNumberField({ name, fieldProps = {}, ...props }) {
  return (
    <Form.Group {...props}>
      <Form.Label>Prix par participant :</Form.Label>
      <InputGroup {...props}>
        <Field name={name} render={({ input }) => <FormControl type="number" required {...input} {...fieldProps} />} />
        <InputGroup.Text>€</InputGroup.Text>
      </InputGroup>
    </Form.Group>
  );
}
