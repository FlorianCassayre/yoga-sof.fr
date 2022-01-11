import { Col, Form, Row } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Field } from 'react-final-form';
import { WEEKDAYS } from '../date';
import { SESSIONS_TYPES } from '../sessions';
import { format, isValid, parse } from 'date-fns';
import { CreateEditForm } from './CreateEditForm';
import {
  TimePickerField,
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
          id: SESSIONS_TYPES[0].id,
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

        <SessionTypeSelectField name="id" fieldProps={{ disabled: editRecordId != null }} className="mb-2" />

        <WeekdaySelectField name="weekday" className="mb-2" />

        <SpotsNumberField name="spots" className="mb-2" />

        <TimePickerRangeFields />

      </CreateEditForm>
    </>
  );
}
