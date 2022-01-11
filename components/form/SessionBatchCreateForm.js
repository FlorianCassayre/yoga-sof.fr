import { useState } from 'react';
import { Col, Form, Row, Spinner } from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import { Field } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { useDataApi } from '../../hooks';
import { dateFormat, parseTime, WEEKDAYS } from '../date';
import { ErrorMessage } from '../ErrorMessage';
import { SESSIONS_TYPES } from '../sessions';
import { addDays, format, getDay, isValid, parse } from 'date-fns';
import { CreateEditForm } from './CreateEditForm';
import { TimePickerRangeFields, SessionTypeSelectField, SpotsNumberField, WeekdaySelectField } from './fields';

export function SessionBatchCreateForm() {

  const [{ isLoading, isError, data, error }] = useDataApi('/api/session_models');

  const [isLocked, setLocked] = useState(true);

  const onLockChange = (type, setValue) => {
    setLocked(!isLocked);
    if(!isLocked) {
      prefillValues(type, setValue)
    }
  }

  const prefillValues = (type, setValue) => {
    const modelData = data.filter(({ id }) => id === type)[0];
    if(modelData) {
      setValue('weekday', modelData.weekday);
      setValue('spots', modelData.spots);
      setValue('time_start', modelData.time_start);
      setValue('time_end', modelData.time_end);
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
    if(values.datesRange !== null && values.datesRange[0] !== null && values.datesRange[1] !== null) {
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

  return (
    <>
      {!isError ? (!isLoading ? (
        <CreateEditForm
          modelId="session_batch"
          initialValues={{
            type: SESSIONS_TYPES[0].id,
            weekday: 0,
            time_start: null,
            time_end: null,
            spots: null,
            datesRange: null,
            ...Object.fromEntries(Object.entries((data ?? []).filter(({ id }) => id === SESSIONS_TYPES[0].id)[0] ?? {}).filter(([key]) => ['weekday', 'spots', 'time_start', 'time_end'].includes(key)))
          }}
          numberFields={['weekday', 'spots']}
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
              <SessionTypeSelectField name="type" className="mb-2" />

              <OnChange name="type">
                {type => isLocked && prefillValues(type, setValue)}
              </OnChange>

              <Form.Check
                checked={isLocked}
                onChange={() => onLockChange(values.type, setValue)}
                type="switch"
                id="switch-lock"
                label="Utiliser le modèle fourni par cette séance"
                className="mb-4"
              />

              <WeekdaySelectField name="weekday" className="mb-2" fieldProps={{ disabled: isLocked }} />

              <OnChange name="weekday">
                {() => setValue('datesRange', null)}
              </OnChange>

              <SpotsNumberField name="spots" className="mb-2" fieldProps={{ disabled: isLocked }} />

              <TimePickerRangeFields disabled={isLocked} className="mb-4" />

              <div className="text-center">
                <div className="mb-2">Sélection des séances à planifier (intervalle) :</div>

                <Field
                  name="datesRange"
                  render={({ input, input: { value, onChange } }) => {

                    return (
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
                    );
                  }}
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
