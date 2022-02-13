import { CreateEditForm } from './CreateEditForm';
import { SimpleInputField } from './fields';

export function UserForm({ editRecordId, container }) {

  return (
    <CreateEditForm
      modelId="users"
      initialValues={{
        name: null,
        email: null,
      }}
      redirect={obj => obj !== null ? `/administration/utilisateurs/${obj.id}` : '/administration/utilisateurs'}
      editRecordId={editRecordId}
      deletable
      container={container}
    >

      <SimpleInputField name="name" label="Nom de l'utilisateur :" required className="mb-2" />

      <SimpleInputField name="email" label="Adresse email de l'utilisateur (facultative) :" type="email" className="mb-2" />

    </CreateEditForm>
  );
}
