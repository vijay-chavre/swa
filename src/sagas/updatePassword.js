import { put, take, select } from 'redux-saga/effects';
import axios from 'axios';
import * as CredentialsActions from '../actions/credentials';
import selectSession from '../selectors/session';
import userSession from '../selectors/user';

export default function* updatePassword() {
  while (true) {
    const fetchAction = yield take(CredentialsActions.UPDATE_PASSWORD);
    const session = yield select(selectSession);
    const user = yield select(userSession);
    const pwd = fetchAction.payload.pwd;
    const fpt = fetchAction.payload.fpt;
    const userId = fetchAction.payload.userId;
    let updateResult;
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      updateResult = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: `v1/credentials/${userId}`,
        headers: { Authorization: `JWT ${session.token}` },
        data: {
          newPassword: pwd,
          requestId: '92edc2e0-e687-4899-b63f-fa5dabffa304',
          fpt,
        },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      if (updateResult && !updateResult.data.error) {
        yield put(CredentialsActions.updatedPassword());
      } else {
        yield put(CredentialsActions.updatePasswordFailed(updateResult.data));
      }
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(CredentialsActions.updatePasswordFailed(updateResult));
    }
  }
}
