/* global window, document */
/* eslint-disable no-constant-condition */
import { put, take } from 'redux-saga/effects';
import axios from 'axios';
import * as SessionActions from '../actions/session';
import config from '../constants/config';

export default function* validateToken() {
  while (true) {
    const validateTokenAction = yield take(SessionActions.VALIDATE_TOKEN);
    const token = validateTokenAction.payload.token;
    const userId = validateTokenAction.payload.user_id;
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: '/v1/sessions/validate-token',
        headers: { 'X-User-Agent': `StudentWebApp/${config.appversion}` },
        data: {
          token,
          userId,
        },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
    } catch (error) {
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(SessionActions.loginFailed(error));
    }
  }
}
