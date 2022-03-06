import { CreateEditForm } from './CreateEditForm';
import { CourseSelectField, UserSelectField } from './fields';

export function CourseRegistrationCreateForm({ redirect, initialValues }) {
  return (
    <CreateEditForm
      modelId="registerUserCourse"
      initialValues={initialValues}
      numberFields={['userId', 'courseId']}
      redirect={redirect}
      successMessages={{
        create: {
          title: 'Inscription réussie',
          body: `L'utilisateur a été inscrit à la séance.`,
        },
      }}
    >
      <UserSelectField name="userId" disabled={initialValues.userId !== undefined} className="mb-2" />

      <CourseSelectField name="courseId" disabled={initialValues.courseId !== undefined} className="mb-2" />
    </CreateEditForm>
  );
}
