/* eslint-disable no-console */
/* eslint-disable no-constant-condition */
import { take, select } from 'redux-saga/effects';

export default function* logActionsSaga() {
  while (true) {
    const action = yield take();

    console.group(action.type);
    console.info('dispatching', action);

    const nextState = yield select();
    console.log('next state', nextState);
    console.groupEnd(action.type);
  }
}
