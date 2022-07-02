import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { usePromiseEffect } from '../../../hooks';
import { getUsers } from '../../../lib/client/api';
import { userDisplayName } from '../../../lib/common';
import { ErrorMessage } from '../../ErrorMessage';

export function UserSelectField({ name, fieldProps = {}, disabled, ...props }) {
  const { isLoading, isError, data, error } = usePromiseEffect(() => getUsers(), []);

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
            {!isLoading && !isError && data.map(user => (
              <option key={user.id} value={user.id}>
                {userDisplayName(user)}
              </option>
            ))}
          </Form.Select>
        )}
      />
    </Form.Group>
  );
}
