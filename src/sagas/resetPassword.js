import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as CredentialsActions from '../actions/credentials';
import selectSession from '../selectors/session';
import selectResetFormValues from '../selectors/resetPasswordFormValues';
import userSession from '../selectors/user';

export default function* resetPassword() {
  while (true) {
    const fetchAction = yield take(CredentialsActions.RESET_PASSWORD);
    const session = yield select(selectSession);
    const user = yield select(userSession);
    const resetFormValues = yield select(selectResetFormValues);
    if (!(resetFormValues && resetFormValues.email)) {
      yield put(CredentialsActions.resetPasswordFailed());
      return;
    }
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      const updateResult = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: 'v1/credentials',
        headers: { Authorization: `JWT ${session.token}` },
        data: {
          email: resetFormValues.email,
          requestId: '92edc2e0-e687-4899-b63f-fa5dabffa304',
        },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(CredentialsActions.resetPasswordComplete());
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(CredentialsActions.resetPasswordFailed());
    }
  }
}
