/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import selectSession from '../selectors/session';
import { SUBMIT_WORKSHEET } from '../actions/submission';

export default function* submitWorksheet() {
  while (true) {
    const submitAction = yield take(SUBMIT_WORKSHEET);
    const submission = submitAction.payload.submission;
    const session = yield select(selectSession);
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const submissionResponse = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        headers: { Authorization: `JWT ${session.token}` },
        url: '/v1/submissions',
        data: submission,
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
    }
  }
}
