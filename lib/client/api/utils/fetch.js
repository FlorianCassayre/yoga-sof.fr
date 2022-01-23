// Inspired by: https://github.com/arbre-app/insee-deces-front/blob/master/src/api/index.js

import { ErrorFetchNoResponse, ErrorFetchTimeout, ErrorFetchWithJson, ErrorFetchWithResponse } from './errors';
import { GET } from './methods';

const FETCH_TIMEOUT = 10_000;

export const jsonFetch = (url, { method = GET, query, body } = {}) => {
  return new Promise((resolve, reject) => {
    let controller = null;
    try {
      controller = new AbortController();
    } catch(e) {
      // AbortController not available (observed on Firefox ESR 52)
    }

    let signal = null, timer = null;
    if(controller !== null) {
      signal = controller.signal;
      timer = setTimeout(() => {
        controller.abort();
        const error = new ErrorFetchTimeout();
        console.error(error);
        reject(error);
      }, FETCH_TIMEOUT);
    }

    const serialize = value => value === null ? '' : typeof value === 'string' || typeof value === 'number' ? value : JSON.stringify(value);
    const serializeRoot = value => Array.isArray(value) ? value.map(serialize).join(',') : serialize(value);

    const urlWithParams = query ? url + '?' + Object.entries(query).filter(([_, v]) => v !== undefined).map(([k, v]) => [k, serializeRoot(v)].map(encodeURIComponent).join("=")).join("&") : url;

    fetch(urlWithParams, { body: body ? JSON.stringify(body) : undefined, signal, method, headers: body ? { 'Content-Type': 'application/json' } : {} })
      .then(response => {
        const { status, ok } = response;
        response.json()
          .then(json => {
            if(timer !== null) {
              clearTimeout(timer);
            }
            if(ok) {
              resolve(json);
            } else {
              reject(new ErrorFetchWithJson(`HTTP ${status}`, status, json));
            }
          })
          .catch(error => {
            console.error(error);
            if(timer !== null) {
              clearTimeout(timer);
            }
            if(error instanceof SyntaxError) {
              reject(new ErrorFetchWithResponse(`HTTP ${status} (non JSON response)`, status));
            } else {
              reject(new ErrorFetchNoResponse(error.message, error));
            }
          });
      })
      .catch(error => {
        console.error(error);
        if(timer !== null) {
          clearTimeout(timer);
        }
        reject(new ErrorFetchNoResponse(error.message, error));
      });
  });
};
