/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as SubmissionActions from '../actions/submission';
import selectSession from '../selectors/session';

export default function* fetchSubmission() {
  while (true) {
    const fetchAction = yield take(SubmissionActions.FETCH_SUBMISSION);
    const submissionId = fetchAction.payload.submissionId;
    const session = yield select(selectSession);
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const submissionResponse = yield axios({
        method: 'get',
        baseURL: ENV.apiEndPoint,
        url: `/v1/submissions/${submissionId}/findOne`,
        params: {
          auth_token: `${session.token}`,
        },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(SubmissionActions.submissionFetched(submissionResponse.data.result));
      Raven.captureBreadcrumb({
        message: 'Fetch student submission',
        category: 'attempt',
        data: {
          submissionId,
        },
      });
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(SubmissionActions.fetchSubmissionFailed(error));
    }
  }
}
