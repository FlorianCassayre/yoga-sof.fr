import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { usePromiseEffect } from '../../../hooks';
import { getUsers } from '../../../lib/client/api';
import { ErrorMessage } from '../../ErrorMessage';

export function UserSelectField({ name, fieldProps = {}, disabled, ...props }) {
  const { isLoading, isError, data, error } = usePromiseEffect(() => getUsers({ select: ['id', 'name'] }), []);

  return (
    <Form.Group {...props}>
      <Form.Label>Utilisateur :</Form.Label>
      {isError && <ErrorMessage error={error} />}
      <Field
        name={name}
        required
        render={({ input }) => (
          <Form.Select {...input} required disabled={isLoading || isError || disabled} {...fieldProps}>
            <option value={null} disabled />
            {!isLoading && !isError && data.map(({ id, name: optionName }) => (
              <option key={id} value={id}>
                {optionName}
              </option>
            ))}
          </Form.Select>
        )}
      />
    </Form.Group>
  );
}
