
import { SESSIONS_TYPES } from '../sessions';
import { CreateEditForm } from './CreateEditForm';
import {
  TimePickerRangeFields,
  SessionTypeSelectField,
  SpotsNumberField,
  WeekdaySelectField,
} from './fields';

export function SessionModelForm({ editRecordId }) {

  return (
    <>
      <CreateEditForm
        modelId="session_models"
        initialValues={{
          type: SESSIONS_TYPES[0].id,
          weekday: 0,
          time_start: null,
          time_end: null,
          spots: null,
        }}
        numberFields={['weekday', 'spots']}
        redirect={() => `/administration/seances`}
        editRecordId={editRecordId}
        deletable
      >

        <SessionTypeSelectField name="type" className="mb-2" />

        <WeekdaySelectField name="weekday" className="mb-2" />

        <SpotsNumberField name="spots" className="mb-2" />

        <TimePickerRangeFields />

      </CreateEditForm>
    </>
  );
}
