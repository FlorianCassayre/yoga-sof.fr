import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { CreateEditForm } from './CreateEditForm';

export function SessionForm({ editRecordId, container }) {
  return (
    <CreateEditForm modelId="sessions" redirect={() => '/administration/seances'} editRecordId={editRecordId} container={container}>
      <Field
        name="notes"
        render={({ input }) => (
          <Form.Group className="mb-3">
            <Form.Label>Notes (vous seul(e) pouvez les voir) :</Form.Label>
            <Form.Control as="textarea" rows={5} {...input} />
          </Form.Group>
        )}
      />
    </CreateEditForm>
  );
}
