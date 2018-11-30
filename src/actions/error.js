import { createAction } from 'redux-actions';

export const ERROR = 'ERROR';

export default createAction(
  ERROR,
  (payload) => payload.error,
  (payload) => payload.meta && ({
    title: payload.title,
    description: payload.description,
  }),
);
