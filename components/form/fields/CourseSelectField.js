import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { usePromiseEffect } from '../../../hooks';
import { getCourses } from '../../../lib/client/api';
import { ErrorMessage } from '../../ErrorMessage';
import { displayCourseName } from '../../../lib/common';

export function CourseSelectField({ name, fieldProps = {}, disabled, ...props }) {
  const { isLoading, isError, data, error } = usePromiseEffect(
    () => getCourses({
      where: {
        isCanceled: false,
        dateEnd: {
          $gt: new Date().toISOString(),
        },
      },
      orderBy: { dateStart: '$asc' },
      select: ['id', 'type', 'dateStart', 'dateEnd'],
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
                  {displayCourseName(obj)}
                </option>
              ))}
          </Form.Select>
        )}
      />
    </Form.Group>
  );
}
