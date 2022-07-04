import { Col, Form, Row, Spinner } from 'react-bootstrap';
import { Field } from 'react-final-form';
import { OnChange } from 'react-final-form-listeners';
import { addDays, format, getDay } from 'date-fns';
import { usePromiseEffect } from '../../hooks';
import { getCourseModels } from '../../lib/client/api';
import {
  COURSE_TYPES,
  WEEKDAYS,
  dateFormat,
  displayCourseModelName,
  parseTime,
} from '../../lib/common';
import { ErrorMessage } from '../ErrorMessage';
import { CreateEditForm } from './CreateEditForm';
import {
  BundleSwitchField,
  CourseTypeSelectField,
  PriceNumberField,
  SimpleInputField,
  SlotsNumberField,
  TimePickerRangeFields, WeekdaySelectField,
} from './fields';

export function CourseBatchCreateForm() {
  const { isLoading, isError, data, error } = usePromiseEffect(getCourseModels, []);

  const prefillValues = (id, setValue) => {
    const modelData = data.filter(({ id: thatId }) => thatId === id)[0];
    if (modelData) {
      setValue('type', modelData.type);
      setValue('weekday', modelData.weekday);
      setValue('slots', modelData.slots);
      setValue('timeStart', modelData.timeStart);
      setValue('timeEnd', modelData.timeEnd);
      setValue('price', modelData.price);
      setValue('bundle', modelData.bundle);
    }
  };

  const isSameWeekday = (date, weekday) => (getDay(date) + 6) % WEEKDAYS.length === parseInt(weekday);

  const computeDatesFromRange = (dateStart, dateEnd, timeStart, timeEnd, weekday) => {
    const setTime = (date, time) => {
      const [hours, minutes] = parseTime(time);
      date.setHours(hours);
      date.setMinutes(minutes);
      date.setSeconds(0);
      date.setMilliseconds(0);
      return date;
    };

    // TODO time
    let date = dateStart;
    const dates = [];

    while (date <= dateEnd) {
      if (isSameWeekday(date, weekday)) {
        dates.push([setTime(new Date(date), timeStart), setTime(new Date(date), timeEnd)]);
      }

      date = addDays(date, 1);
    }

    return dates;
  };

  const renderRecap = values => {
    if (values.timeStart !== null && values.timeEnd !== null && values.dateStart !== null && values.dateEnd !== null) {
      const dates = computeDatesFromRange(new Date(values.dateStart), new Date(values.dateEnd), values.timeStart, values.timeEnd, values.weekday);
      const plural = dates.length > 1;

      return (
        <>
          <h2 className="h5">Récapitulatif</h2>
          {dates.length > 0 ? (
            <>
              La période sélectionnée correspond au
              {plural && 'x'}
              {' '}
              <strong>{dates.length}</strong>
              {' '}
              {WEEKDAYS[values.weekday].toLowerCase()}
              {plural && 's'}
              {' '}
              suivant
              {plural && 's'}
              {' '}
              :
              <ul>
                {dates.map(([start]) => (
                  <li key={start.getTime()}>{format(start, dateFormat)}</li>
                ))}
              </ul>
            </>
          ) : `Aucune date ne se situe dans l'intervalle sélectionné`}

        </>
      );
    } else {
      return null;
    }
  };

  const MODEL_NONE = 'NONE';

  return !isError ? (
    !isLoading ? (
      <CreateEditForm
        modelId="courseBatch"
        initialValues={{
          modelId: MODEL_NONE,
          type: null,
          weekday: null,
          timeStart: null,
          timeEnd: null,
          slots: null,
          price: null,
          bundle: false,
          bundleName: null,
          dateStart: null,
          dateEnd: null,
          ...Object.fromEntries(
            // eslint-disable-next-line
            Object.entries((data ?? []).filter(({ id }) => id === COURSE_TYPES[0].id)[0] ?? {}).filter(([key]) => ['type', 'weekday', 'timeStart', 'timeEnd', 'slots', 'price', 'bundle'].includes(key)),
          ),
        }}
        numberFields={['weekday', 'slots', 'price']}
        redirect={() => '/administration/seances'}
        deletable
        loading={isLoading}
        submitCallback={submittedData => {
          const { weekday, timeStart, timeEnd, dateStart, dateEnd, bundle, bundleName, ...rest } = submittedData;
          rest.dates = computeDatesFromRange(new Date(dateStart), new Date(dateEnd), timeStart, timeEnd, weekday).map(two => two.map(date => date.getTime()));
          return { bundle, ...(bundle ? { bundleName } : {}), ...rest };
        }}
        successMessages={{
          create: {
            title: 'Séances planifiées',
            body: 'Les séances ont été panifiées avec succès.',
          },
        }}
      >
        {({
          form: { mutators: { setValue } },
          values,
        }) => (
          <>
            <Form.Group className="mb-4">
              <Form.Label>Modèle de séance :</Form.Label>
              <Field
                name="modelId"
                render={({ input }) => (
                  <Form.Select {...input} required>
                    <option value={MODEL_NONE}>Aucun modèle</option>
                    {data.map(model => (
                      <option key={model.id} value={model.id}>
                        {displayCourseModelName(model)}
                      </option>
                    ))}
                  </Form.Select>
                )}
              />
              <Form.Text className="text-muted">Facultatif, sert à pré-remplir les données ci-dessous</Form.Text>
            </Form.Group>

            <OnChange name="modelId">{modelId => modelId !== MODEL_NONE && prefillValues(parseInt(modelId), setValue)}</OnChange>

            <CourseTypeSelectField name="type" className="mb-2" fieldProps={{ disabled: values.modelId !== MODEL_NONE }} />

            <WeekdaySelectField name="weekday" className="mb-2" fieldProps={{ disabled: values.modelId !== MODEL_NONE }} />

            {/* <OnChange name="weekday">{() => {
              setValue('dateStart', null);
              setValue('dateEnd', null);
            }}</OnChange> */}

            <TimePickerRangeFields disabled={values.modelId !== MODEL_NONE} className="mb-2" />

            <SlotsNumberField name="slots" className="mb-2" fieldProps={{ disabled: values.modelId !== MODEL_NONE }} />

            <PriceNumberField name="price" className="mb-2" fieldProps={{ disabled: values.modelId !== MODEL_NONE }} />

            <BundleSwitchField name="bundle" value={values.bundle} className="mb-2" fieldProps={{ disabled: values.modelId !== MODEL_NONE }} />

            {values.bundle && (
              <SimpleInputField name="bundleName" required label="Nom du lot :" className="mb-2" />
            )}

            <Row className="mb-2">
              <SimpleInputField name="dateStart" type="date" required label="Date de début :" as={Col} />
              <SimpleInputField name="dateEnd" type="date" required label="Date de fin :" as={Col} />
            </Row>

            <div className="text-center">
              <small>
                Il n'est pas possible d'exclure des dates de l'intervalle sélectionné.
                <br />
                En revanche vous pouvez soumettre ce formulaire plusieurs fois.
              </small>
            </div>

            <div className="mt-2">{renderRecap(values)}</div>
          </>
        )}
      </CreateEditForm>
    ) : (
      <div className="m-5 text-center">
        <Spinner animation="border" />
      </div>
    )
  ) : (
    <ErrorMessage error={error}>Une erreur est survenue lors du chargement des modèles de séances.</ErrorMessage>
  );
}
