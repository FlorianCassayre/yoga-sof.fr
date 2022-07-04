import { CreateEditForm } from './CreateEditForm';
import { SimpleInputField } from './fields';

export function CourseBundleForm({ editRecordId, container }) {
  return (
    <CreateEditForm modelId="courseBundles" redirect={() => `/administration/seances/lots/${editRecordId}`} editRecordId={editRecordId} container={container}>
      <SimpleInputField name="name" label="Nom du lot :" required />
    </CreateEditForm>
  );
}
