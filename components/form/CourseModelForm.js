import { CreateEditForm } from './CreateEditForm';
import {
  BundleSwitchField,
  CourseTypeSelectField,
  PriceNumberField,
  SlotsNumberField,
  TimePickerRangeFields,
  WeekdaySelectField,
} from './fields';

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
        bundle: false,
      }}
      numberFields={['weekday', 'slots', 'price']}
      redirect={() => '/administration/seances'}
      editRecordId={editRecordId}
      deletable
      container={container}
    >
      {({ values }) => (
        <>
          <CourseTypeSelectField name="type" className="mb-2" />

          <WeekdaySelectField name="weekday" className="mb-2" />

          <TimePickerRangeFields className="mb-2" />

          <SlotsNumberField name="slots" className="mb-2" />

          <PriceNumberField name="price" className="mb-2" />

          <BundleSwitchField name="bundle" value={values.bundle} className="mb-2" />
        </>
      )}
    </CreateEditForm>
  );
}
