import { Form, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Field } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { usePromiseEffect } from '../../hooks';
import { getSessionModels } from '../../lib/client/api';
import { dateFormat, formatTime, parseTime, WEEKDAYS } from '../date';
import { ErrorMessage } from '../ErrorMessage';
import { SESSIONS_TYPES } from '../sessions';
import { addDays, format, getDay } from 'date-fns';
import { CreateEditForm } from './CreateEditForm';
import {
  TimePickerRangeFields,
  SessionTypeSelectField,
  SlotsNumberField,
  WeekdaySelectField,
  PriceNumberField,
} from './fields';

export function SessionBatchCreateForm() {

  const { isLoading, isError, data, error } = usePromiseEffect(getSessionModels, []);

  const prefillValues = (id, setValue) => {
    const modelData = data.filter(({ id: thatId }) => thatId === id)[0];
    if(modelData) {
      setValue('type', modelData.type);
      setValue('weekday', modelData.weekday);
      setValue('slots', modelData.slots);
      setValue('time_start', modelData.time_start);
      setValue('time_end', modelData.time_end);
      setValue('price', modelData.price);
    }
  };

  const isSameWeekday = (date, weekday) => (getDay(date) + 6) % WEEKDAYS.length === parseInt(weekday);

  const computeDatesFromRange = (range, timeStart, timeEnd, weekday) => {
    // TODO time
    let date = range[0];
    const dates = [];

    while(date <= range[1]) {
      if(isSameWeekday(date, weekday)) {
        const setTime = (date, time) => {
          const [hours, minutes] = parseTime(time);
          date.setHours(hours);
          date.setMinutes(minutes);
          date.setSeconds(0);
          date.setMilliseconds(0);
          return date;
        };

        dates.push([setTime(new Date(date), timeStart), setTime(new Date(date), timeEnd)]);
      }

      date = addDays(date, 1);
    }

    return dates;
  };

  const renderRecap = values => {
    if(values.time_start !== null && values.time_end !== null && values.datesRange !== null && values.datesRange[0] !== null && values.datesRange[1] !== null) {
      const dates = computeDatesFromRange(values.datesRange, values.time_start, values.time_end, values.weekday);

      return (
        <>
          <h2 className="h5">Récapitulatif</h2>

          Période sélectionnée : <strong>{format(values.datesRange[0], dateFormat)} au {format(values.datesRange[1], dateFormat)}</strong>
          <br />
          Cela correspond aux <strong>{dates.length}</strong> dates suivantes :
          <ul>
            {dates.map(([start]) => (
              <li key={start.getTime()}>
                {format(start, dateFormat)}
              </li>
            ))}
          </ul>
        </>
      )
    } else {
      return null;
    }
  };

  const MODEL_NONE = 'NONE';

  return (
    <>
      {!isError ? (!isLoading ? (
        <CreateEditForm
          modelId="session_batch"
          initialValues={{
            model_id: MODEL_NONE,
            type: null,
            weekday: null,
            time_start: null,
            time_end: null,
            slots: null,
            price: null,
            datesRange: null,
            ...Object.fromEntries(Object.entries((data ?? []).filter(({ id }) => id === SESSIONS_TYPES[0].id)[0] ?? {}).filter(([key]) => ['type', 'weekday', 'time_start', 'time_end', 'slots', 'price'].includes(key)))
          }}
          numberFields={['weekday', 'slots', 'price']}
          redirect={() => `/administration/seances`}
          deletable
          loading={isLoading}
          submitCallback={data => {
            const { weekday, time_start, time_end, datesRange, ...rest } = data;
            rest['dates'] = computeDatesFromRange(datesRange, time_start, time_end, weekday).map(two => two.map(date => date.getTime()));
            return rest;
          }}
        >
          {({ form: { mutators: { setValue } }, values }) => (
            <>
              <Form.Group className="mb-4">
                <Form.Label>Modèle de séance :</Form.Label>
                <Field
                  name="model_id"
                  render={({ input }) => (
                    <Form.Select {...input} required>
                      <option value={MODEL_NONE}>Aucun modèle</option>
                      {data.map(({ id, type, weekday, time_start: timeStart, time_end: timeEnd }) => (
                        <option key={id} value={id}>
                          {SESSIONS_TYPES.filter(({ id }) => id === type)[0].title} le {WEEKDAYS[weekday].toLowerCase()} de {formatTime(timeStart)} à {formatTime(timeEnd)}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                />
                <Form.Text className="text-muted">
                  Facultatif, sert à pré-remplir les données ci-dessous
                </Form.Text>
              </Form.Group>

              <OnChange name="model_id">
                {modelId => modelId !== MODEL_NONE && prefillValues(parseInt(modelId), setValue)}
              </OnChange>

              <SessionTypeSelectField name="type" className="mb-2" fieldProps={{ disabled: values.model_id !== MODEL_NONE }} />

              <WeekdaySelectField name="weekday" className="mb-2" fieldProps={{ disabled: values.model_id !== MODEL_NONE }} />

              <OnChange name="weekday">
                {() => setValue('datesRange', null)}
              </OnChange>

              <TimePickerRangeFields disabled={values.model_id !== MODEL_NONE} className="mb-2" />

              <SlotsNumberField name="slots" className="mb-2" fieldProps={{ disabled: values.model_id !== MODEL_NONE }} />

              <PriceNumberField name="price" className="mb-4" fieldProps={{ disabled: values.model_id !== MODEL_NONE }} />

              <div className="text-center">
                <div className="mb-2">Sélection des séances à planifier (intervalle) :</div>

                <Field
                  name="datesRange"
                  render={({ input: { value, onChange } }) => (
                    <DatePicker
                      selected={value && value[0]}
                      onChange={onChange}
                      startDate={value && value[0]}
                      endDate={value && value[1]}
                      filterDate={date => isSameWeekday(date, values.weekday)}
                      selectsRange
                      selectsDisabledDaysInRange
                      inline
                    />
                  )}
                />

                <small>Il n'est pas possible d'exclure des dates de l'intervalle sélectionné.<br />En revanche vous pouvez soumettre ce formulaire plusieurs fois.</small>
              </div>

              <div className="mt-2">
                {renderRecap(values)}
              </div>
            </>
          )}

        </CreateEditForm>
      ) : (
        <div className="m-5 text-center">
          <Spinner animation="border" />
        </div>
      )) : (
        <ErrorMessage error={error}>
          Une erreur est survenue lors du chargement des modèles de séances.
        </ErrorMessage>
      )}
    </>
  );
}
