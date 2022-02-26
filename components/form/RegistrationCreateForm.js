import { CreateEditForm } from './CreateEditForm';
import { SessionSelectField, UserSelectField } from './fields';

export function RegistrationCreateForm({ redirect, initialValues }) {
  return (
    <CreateEditForm
      modelId="register"
      initialValues={initialValues}
      numberFields={['user_id', 'session_id']}
      redirect={redirect}
      successMessages={{
        create: {
          title: 'Inscription réussie',
          body: 'L\'utilisateur a été inscrit à la séance.',
        },
      }}
    >
      <UserSelectField name="user_id" disabled={initialValues.user_id !== undefined} className="mb-2" />

      <SessionSelectField name="session_id" disabled={initialValues.session_id !== undefined} className="mb-2" />
    </CreateEditForm>
  );
}
