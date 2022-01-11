import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, Form, Modal, Spinner } from 'react-bootstrap';
import { Form as FinalForm } from 'react-final-form';
import { BsCheckLg, BsPlusLg, BsTrash, BsXLg } from 'react-icons/bs';
import { ErrorMessage } from '../ErrorMessage';
import { isErrorCode } from '../http';

export function CreateEditForm({ modelId, editRecordId, deletable, initialValues = {}, redirect, numberFields = [], disabled, loading, submitCallback, children }) {

  const isEdit = editRecordId != null;

  const urlBase = `/api/${modelId}`;
  const url = isEdit ? `${urlBase}/${editRecordId}` : urlBase;

  const [isSubmitLoading, setSubmitLoading] = useState(false);
  const [initialData, setInitialData] = useState(isEdit ? null : initialValues);
  const [loadError, setLoadError] = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const router = useRouter();

  const [deleteDialogShow, setDeleteDialogShow] = useState(false);

  const renderLoader = () => (
    <div className="m-5 text-center">
      <Spinner animation="border" />
    </div>
  );

  useEffect(() => {
    if(isEdit) {
      fetch(url)
        .then(response => {
          if(isErrorCode(response.status)) {
            return response.json().then(json => {
              throw new Error(json.error);
            });
          }
          return response.json();
        })
        .then(json => {
          setInitialData(json);
        })
        .catch(e => {
          setLoadError(e);
        });
    }
  }, []);

  const submitSuccessCallback = json => {
    router.push(redirect(json));
  };

  const onSubmit = data => {
    numberFields.forEach(field => {
      const value = data[field];
      if(value != null) {
        data[field] = parseInt(value);
      }
    });

    if(submitCallback) {
      data = submitCallback(data);
    }

    setSubmitLoading(true);

    fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      body: JSON.stringify(data),
      headers: {
        'Content-Type': 'application/json'
      },
    })
      .then(response => {
        if(isErrorCode(response.status)) {
          return response.json().then(json => {
            throw new Error(json.error);
          });
        }
        return response.json();
      })
      .then(json => {
        // Stay in loading state, until the redirect happens
        submitSuccessCallback(json);
      })
      .catch(e => {
        setSubmitError(e);
        setSubmitLoading(false);
      });
  };

  const onCancel = () => {
    router.push(redirect(isEdit ? initialValues : null));
  };

  const onPreDelete = () => {
    setDeleteDialogShow(true);
  };

  const onDelete = () => {
    setDeleteDialogShow(false);

    fetch(url, {
      method: 'DELETE',
    })
      .then(response => {
        if(isErrorCode(response.status)) {
          return response.json().then(json => {
            throw new Error(json.error);
          });
        }
        return response.json();
      })
      .then(json => {
        submitSuccessCallback(json);
      })
      .catch(e => {
        setSubmitError(e);
        setSubmitLoading(false);
      });
  }

  const renderForm = props => !isSubmitLoading && !loading ? (
    <Form onSubmit={props.handleSubmit}>

      {submitError && (
        <ErrorMessage error={submitError}>
          Une erreur est survenue lors de la soumission du formulaire.
        </ErrorMessage>
      )}

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
                Cette action est irrévocable.
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
  ) : renderLoader();

  return !loadError ? (initialData != null ? (
    <FinalForm
      onSubmit={onSubmit}
      initialValues={initialData}
      mutators={{
        setValue: ([field, value], state, { changeValue }) => changeValue(state, field, () => value)
      }}
      /*validate={validate}*/
      render={renderForm}
    />
  ) : renderLoader()) : (
    <ErrorMessage error={loadError}>
      Une erreur est survenue lors du chargement des données.
    </ErrorMessage>
  );
}
