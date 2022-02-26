import { CreateEditForm } from './CreateEditForm';
import { TimePickerRangeFields, SessionTypeSelectField, SlotsNumberField, WeekdaySelectField, PriceNumberField } from './fields';

export function SessionModelForm({ editRecordId, container }) {
  return (
    <CreateEditForm
      modelId="session_models"
      initialValues={{
        type: null,
        weekday: null,
        time_start: null,
        time_end: null,
        slots: null,
        price: null,
      }}
      numberFields={['weekday', 'slots', 'price']}
      redirect={() => '/administration/seances'}
      editRecordId={editRecordId}
      deletable
      container={container}
    >
      <SessionTypeSelectField name="type" className="mb-2" />

      <WeekdaySelectField name="weekday" className="mb-2" />

      <TimePickerRangeFields className="mb-2" />

      <SlotsNumberField name="slots" className="mb-2" />

      <PriceNumberField name="price" className="mb-2" />
    </CreateEditForm>
  );
}
