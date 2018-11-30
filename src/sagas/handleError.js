/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
import { take } from 'redux-saga/effects';

export default function* errorSaga() {
  while (true) {
    const action = yield take();

    if (action.error) {
      Raven.captureException(action.error);
      console.error(action.payload, action.meta);
    }
  }
}
