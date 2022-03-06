import React, { useEffect, useState } from 'react';
import { Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { BsCheckLg } from 'react-icons/bs';
import { Form as FinalForm } from 'react-final-form';
import { usePromiseCallback, usePromiseEffect } from '../../hooks';
import { joiValidator } from '../../lib/client';
import { getSelfUser, postSelfUser } from '../../lib/client/api';
import { schemaSelfUserBody } from '../../lib/common';
import { useNotificationsContext } from '../../state';
import { ErrorMessage } from '../ErrorMessage';
import { FloatingInputField, SwitchField } from './fields';

export function UserSelfForm() {
  const { notify } = useNotificationsContext();

  const [{ isLoading: isSubmitLoading, isError: isSubmitError, data: submitResult /* error: submitError */ }, submitDispatcher] = usePromiseCallback(postSelfUser, []);
  const { isLoading: isInitialDataLoading, /* isError: isInitialDataError, */ data: initialData /* error: initialDataError */ } = usePromiseEffect(getSelfUser, []);
  const [actualInitialData, setActualData] = useState(null);
  useEffect(() => {
    if (initialData) {
      setActualData(initialData);
    }
  }, [initialData]);
  useEffect(() => {
    if (submitResult && !isSubmitError) {
      setActualData(submitResult);
    }
  }, [submitResult, isSubmitError, initialData]);

  const reloadSession = () => {
    // https://stackoverflow.com/a/70405437
    const event = new Event('visibilitychange');
    document.dispatchEvent(event);
  };

  useEffect(() => {
    if (submitResult) {
      notify({
        title: 'Modifications enregistrées',
        body: 'Vos informations personnelles ont été mises à jour.',
      });

      reloadSession();
    }
  }, [submitResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = data => {
    const finalData = { ...data, customEmail: data.customEmail ? data.customEmail : null };

    submitDispatcher(finalData);
  };

  const renderLoader = () => (
    <div className="text-center">
      <Spinner animation="border" />
    </div>
  );

  const renderForm = ({ handleSubmit, errors }) => (
    <Form onSubmit={handleSubmit}>
      {isSubmitError && <ErrorMessage />}
      <Row>
        <Col xs={12} md={6} xl={3} className="mb-2 mb-xl-0">
          <FloatingInputField name="customName" label="Nom" placeholder="Nom" required fieldProps={{ disabled: isSubmitLoading }} />
        </Col>
        <Col xs={12} md={6} xl={3} className="mb-2 mb-xl-0">
          <FloatingInputField name="customEmail" label="Adresse email" placeholder="Adresse email" type="email" parse={v => v || null} fieldProps={{ disabled: isSubmitLoading }} />
        </Col>
        <Col xs={12} md={6} xl={3} className="mb-3 my-xl-auto">
          <SwitchField name="receiveEmails" label="Recevoir les notifications par email" fieldProps={{ disabled: isSubmitLoading }} />
        </Col>
        <Col xs={12} xl={3} className="mb-2 my-xl-auto">
          <Button type="submit" disabled={isSubmitLoading || Object.keys(errors).length > 0} className="w-100">
            <BsCheckLg className="icon me-2" />
            Sauvegarder
          </Button>
        </Col>
      </Row>
    </Form>
  );

  return !isInitialDataLoading && actualInitialData ? (
    <FinalForm onSubmit={onSubmit} initialValues={actualInitialData} validate={values => joiValidator(values, schemaSelfUserBody)} render={renderForm} />
  ) : (
    renderLoader()
  );
}
