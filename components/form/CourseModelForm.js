import { CreateEditForm } from './CreateEditForm';
import { TimePickerRangeFields, CourseTypeSelectField, SlotsNumberField, WeekdaySelectField, PriceNumberField } from './fields';

export function CourseModelForm({ editRecordId, container }) {
  return (
    <CreateEditForm
      modelId="courseModels"
      initialValues={{
        type: null,
        weekday: null,
        timeStart: null,
        timeEnd: null,
        slots: null,
        price: null,
      }}
      numberFields={['weekday', 'slots', 'price']}
      redirect={() => '/administration/seances'}
      editRecordId={editRecordId}
      deletable
      container={container}
    >
      <CourseTypeSelectField name="type" className="mb-2" />

      <WeekdaySelectField name="weekday" className="mb-2" />

      <TimePickerRangeFields className="mb-2" />

      <SlotsNumberField name="slots" className="mb-2" />

      <PriceNumberField name="price" className="mb-2" />
    </CreateEditForm>
  );
}