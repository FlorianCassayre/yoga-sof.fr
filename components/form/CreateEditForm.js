import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { Form as FinalForm } from 'react-final-form';
import { BsCheckLg, BsPlusLg, BsTrash, BsXLg } from 'react-icons/bs';
import { usePromiseCallback, usePromiseEffect } from '../../hooks';
import { DELETE, POST, PUT, jsonFetch } from '../../lib/client/api';
import { useNotificationsContext } from '../../state';
import { ErrorMessage } from '../ErrorMessage';

const BasicContainer = props => props.children;

export function CreateEditForm({
  modelId,
  safe,
  editRecordId,
  deletable,
  initialValues = {},
  redirect,
  numberFields = [],
  disabled,
  loading,
  submitCallback,
  successMessages = {},
  container: Container = BasicContainer,
  children,
}) {
  const { notify } = useNotificationsContext();
  const router = useRouter();

  const isEdit = editRecordId != null;

  const urlBase = `/api/${modelId}`;
  const url = isEdit ? `${urlBase}/${editRecordId}` : urlBase;
  const urlSubmit = `${url}${safe ? '/safe' : ''}`;

  const [lastAction, setLastAction] = useState(null);

  const [{ isLoading: isSubmitLoading, isError: isSubmitError, data: submitResult, error: submitError }, submitDispatcher] = usePromiseCallback(options => jsonFetch(urlSubmit, options), []);
  const { isLoading: isInitialDataLoading, isError: isInitialDataError, data: initialData, error: initialDataError } = usePromiseEffect(isEdit ? () => jsonFetch(url) : null, []);

  const initialFormData = isEdit ? initialData : initialValues;

  const defaultSuccessMessages = {
    create: {
      title: 'Création réussie',
      body: 'L\'enregistrement a été créé avec succès.',
      icon: BsPlusLg,
    },
    edit: {
      title: 'Modifications appliquées',
      body: 'L\'enregistrement a été modifié avec succès.',
      icon: BsCheckLg,
    },
    delete: {
      title: 'Suppression réussie',
      body: 'L\'enregistrement a été supprimé avec succès.',
      icon: BsTrash,
    },
  };

  const submitSuccessCallback = json => {
    notify(
      lastAction === POST
        ? { ...defaultSuccessMessages.create, ...successMessages.create }
        : lastAction === PUT
          ? { ...defaultSuccessMessages.edit, ...successMessages.edit }
          : { ...defaultSuccessMessages.delete, ...successMessages.delete },
    );

    router.push(redirect(json));
  };

  useEffect(() => {
    if (submitResult) {
      submitSuccessCallback(submitResult);
    }
  }, [submitResult]); // eslint-disable-line react-hooks/exhaustive-deps

  const [deleteDialogShow, setDeleteDialogShow] = useState(false);

  const renderLoader = () => (
    <div className="m-5 text-center">
      <Spinner animation="border" />
    </div>
  );

  const onSubmit = data => {
    numberFields.forEach(field => {
      const value = data[field];
      if (value != null) {
        data[field] = parseInt(value); // eslint-disable-line no-param-reassign
      }
    });

    const processedData = submitCallback ? submitCallback(data) : data;

    const method = isEdit ? PUT : POST;
    setLastAction(method);
    submitDispatcher({ method, body: processedData });
  };

  const onCancel = () => {
    router.push(redirect(isEdit ? initialData : null));
  };

  const onPreDelete = () => {
    setDeleteDialogShow(true);
  };

  const onDelete = () => {
    setDeleteDialogShow(false);

    const method = DELETE;
    setLastAction(method);
    submitDispatcher({ method });
  };

  const renderForm = props => (!submitResult && !loading && !isSubmitLoading ? (
    <Form onSubmit={props.handleSubmit}>
      {isSubmitError && <ErrorMessage error={submitError}>Une erreur est survenue lors de la soumission du formulaire.</ErrorMessage>}

      {typeof children === 'function' ? children(props) : children}

      <div className="mt-3 text-end">
        <Button variant="secondary" className="me-2" onClick={onCancel}>
          <BsXLg className="icon me-2" />
          Annuler
        </Button>

        {!isEdit ? (
          <Button type="submit" variant="success" disabled={disabled}>
            <BsPlusLg className="icon me-2" />
            Créer
          </Button>
        ) : (
          <>
            <Modal show={deleteDialogShow} onHide={() => setDeleteDialogShow(false)}>
              <Modal.Header closeButton>
                <Modal.Title>Suppression de l'enregistrement</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                Souhaitez-vous vraiment supprimer cet enregistrement ?
                <br />
                Cette action est irréversible.
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={() => setDeleteDialogShow(false)}>
                  <BsXLg className="icon me-2" />
                  Annuler
                </Button>
                <Button variant="danger" onClick={onDelete} disabled={disabled}>
                  <BsTrash className="incon me-2" />
                  Confirmer la suppression
                </Button>
              </Modal.Footer>
            </Modal>

            {deletable && (
            <Button variant="danger" className="me-2" onClick={onPreDelete} disabled={disabled}>
              <BsTrash className="icon me-2" />
              Supprimer
            </Button>
            )}
            <Button type="submit" disabled={disabled}>
              <BsCheckLg className="icon me-2" />
              Appliquer les modifications
            </Button>
          </>
        )}
      </div>
    </Form>
  ) : (
    renderLoader()
  ));

  return (
    <Container isLoading={isInitialDataLoading} isError={!!isInitialDataError} error={initialDataError} data={initialFormData}>
      <FinalForm
        onSubmit={onSubmit}
        initialValues={initialFormData}
        mutators={{ setValue: ([field, value], state, { changeValue }) => changeValue(state, field, () => value) }}
        /* validate={validate} */
        render={renderForm}
      />
    </Container>
  );
}
