/* global window, document */
/* eslint-disable no-constant-condition */
import { put, select, take } from 'redux-saga/effects';
import axios from 'axios';
import * as SessionActions from '../actions/session';
import config from '../constants/config';

export default function* checkPassword() {
  while (true) {

    const fetchAction = yield take(SessionActions.CHECK_PASSWORD);
    const username = fetchAction.payload.username;
    const password = fetchAction.payload.password;
    try {
      yield put({ type: 'SET_LOADING', isLoading: true });
      yield put(SessionActions.checkPassword());
      const createSessionResponse = yield axios({
        method: 'post',
        baseURL: ENV.apiEndPoint,
        url: '/v1/sessions',
        headers: { 'X-User-Agent': `StudentWebApp/${config.appversion}` },
        data: {
          username: username,
          password: password,
        },
      });
      yield put({ type: 'SET_LOADING', isLoading: false });
      //to save username for accessing settings
      createSessionResponse.data.username = username;
      
      yield put(SessionActions.createSession(createSessionResponse.data));
      yield put(SessionActions.reloginValid());
    } catch (error) {
      Raven.captureException(error);
      yield put({ type: 'SET_LOADING', isLoading: false });
      yield put(SessionActions.reloginInvalid());
    }
  }
}
