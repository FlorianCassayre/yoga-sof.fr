import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { usePromiseEffect } from '../../../hooks';
import { getSessions } from '../../../lib/client/api';
import { ErrorMessage } from '../../ErrorMessage';
import { renderSessionName } from '../../table';

export function SessionSelectField({ name, fieldProps = {}, disabled, ...props }) {
  const { isLoading, isError, data, error } = usePromiseEffect(
    () => getSessions({
      where: {
        is_canceled: false,
        date_end: {
          $gt: new Date().toISOString(),
        },
      },
      orderBy: { date_start: '$asc' },
      select: ['id', 'type', 'date_start', 'date_end'],
    }),
    [],
  );

  return (
    <Form.Group {...props}>
      <Form.Label>Séance :</Form.Label>
      {isError && <ErrorMessage error={error} />}
      <Field
        name={name}
        required
        render={({ input }) => (
          <Form.Select {...input} required disabled={isLoading || isError || disabled} {...fieldProps}>
            <option value={null} disabled />
            {!isLoading
              && !isError
              && data.map(obj => (
                <option key={obj.id} value={obj.id}>
                  {renderSessionName(obj)}
                </option>
              ))}
          </Form.Select>
        )}
      />
    </Form.Group>
  );
}
