import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Form, Spinner } from 'react-bootstrap';
import { Form as FinalForm } from 'react-final-form';
import { BsCheckLg, BsPlusLg } from 'react-icons/bs';
import { ErrorMessage } from '../ErrorMessage';

export function CreateEditForm({ modelId, editRecordId, initialValues, redirect, numberFields = [], children }) {

  const isEdit = editRecordId != null;

  const urlBase = `/api/${modelId}`;
  const url = isEdit ? `${urlBase}/${editRecordId}` : urlBase;

  const [isSubmitLoading, setSubmitLoading] = useState(false);
  const [initialData, setInitialData] = useState(isEdit ? null : initialValues);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const router = useRouter();

  const renderLoader = () => (
    <div className="m-5 text-center">
      <Spinner animation="border" />
    </div>
  );

  useEffect(() => {
    if(isEdit) {
      fetch(url)
        .then(result => result.json())
        .then(json => {
          setInitialData(json);
        })
        .catch(e => {
          setLoadError(e);
        });
    }
  }, []);

  const submitSuccessCallback = json => {
    console.log(json);
    router.push(redirect(json));
  };

  const onSubmit = data => {
    numberFields.forEach(field => {
      const value = data[field];
      if(value != null) {
        data[field] = parseInt(value);
      }
    });

    console.log(data);

    setSubmitLoading(true);

    fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(result => result.json())
      .then(json => {
        // Stay in loading state, until the redirect happens
        submitSuccessCallback(json);
      })
      .catch(e => {
        setSubmitError(e);
        setSubmitLoading(false);
      });
  }

  const renderForm = ({ handleSubmit }) => !isSubmitLoading ? (
    <Form onSubmit={handleSubmit}>

      {submitError && (
        <ErrorMessage error={submitError}>
          Une erreur est survenue lors de la soumission du formulaire.
        </ErrorMessage>
      )}

      {children}

      <div className="mt-3 text-end">
        {!isEdit ? (
          <Button type="submit" variant="success">
            <BsPlusLg className="icon me-2" />
            Créer
          </Button>
        ) : (
          <Button type="submit">
            <BsCheckLg className="icon me-2" />
            Appliquer les modifications
          </Button>
        )}
      </div>

    </Form>
  ) : renderLoader();

  return !loadError ? (initialData != null ? (
    <FinalForm
      onSubmit={onSubmit}
      initialValues={initialData}
      /*validate={validate}*/
      render={renderForm}
    />
  ) : renderLoader()) : (
    <ErrorMessage error={loadError}>
      Une erreur est survenue lors du chargement des données.
    </ErrorMessage>
  );
}
