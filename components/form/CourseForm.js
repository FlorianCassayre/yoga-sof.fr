import { Form } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { CreateEditForm } from './CreateEditForm';
import { SlotsNumberField } from './fields';

export function CourseForm({ editRecordId, container }) {
  return (
    <CreateEditForm
      modelId="courses"
      safe
      redirect={() => '/administration/seances'}
      editRecordId={editRecordId}
      container={container}
      submitCallback={({ slots, notes }) => ({ slots, notes: notes ?? null })}
      numberFields={['slots']}
    >
      <SlotsNumberField name="slots" />
      <div className="mb-2">
        <small className="text-muted">Remarque : le nombre de places ne peut être inférieur au nombre de personnes déjà inscrites.</small>
      </div>
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
