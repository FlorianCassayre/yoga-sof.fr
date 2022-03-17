import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { COURSE_TYPES } from '../../../lib/common';

export function CourseTypeSelectField({ name, fieldProps = {}, ...props }) {
  return (
    <Form.Group {...props}>
      <Form.Label>Type de séance :</Form.Label>
      <Field
        name={name}
        render={({ input }) => (
          <Form.Select {...input} required {...fieldProps}>
            <option value={null} disabled />
            {COURSE_TYPES.map(({ id, title }) => (
              <option key={id} value={id}>
                {title}
              </option>
            ))}
          </Form.Select>
        )}
      />
    </Form.Group>
  );
}
